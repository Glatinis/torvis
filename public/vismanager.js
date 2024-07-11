let network;
let nodes;
let edges;
let count;

async function uploadTorrent() {
    const fileInput = document.getElementById("torrentfile");
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("torrentfile", file);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const networkInfo = await response.json();
        console.log("Result:", networkInfo);
        buildNetwork(networkInfo, file);
        
        handleNodeClick(networkInfo);

    } catch (error) {
        console.error("Error:", error);
    }
}

function handleNodeClick(networkInfo) {
    network.on("click", async function (properties) {
        var nodeId = network.getNodeAt({ x: properties.event.srcEvent.offsetX, y: properties.event.srcEvent.offsetY });
        if (nodeId) {
            var node = nodes.get(nodeId);
            console.log(node);

            // Check if node has children and it's not node ID 0
            if (nodeId !== 0 && hasChildren(nodeId)) {
                removeChildren(nodeId);

                // Return here to prevent immediate recreation
                return;
            }

            if (node.label == "leechers") {
                addNodeWithLabel(networkInfo.leechers.toString(), nodeId);
            } 
            else if (node.label == "seeders") {
                addNodeWithLabel(networkInfo.seeders.toString(), nodeId);
            }
            else if (node.label == "transactionId") {
                addNodeWithLabel(networkInfo.transactionId.toString(), nodeId);
            } 
            else if (node.label == "peers") {
                await addPeers(networkInfo.peers, nodeId);
            }
            else if (new RegExp("peer \\d+").test(node.label)) {
                let peerInfo = networkInfo.peers[nodeId - 1];
                addNodeWithLabel(peerInfo.ip + ":" + peerInfo.port, nodeId, "box");
            }
        }
    });
}

function buildNetwork(networkInfo, file) {
    let container = document.getElementById("peernet");

    nodes = new vis.DataSet();
    edges = new vis.DataSet();

    nodes.add({id: 0, label: file.name, shape: "box"});

    count = 1;
    for (let prop in networkInfo) {
        if (Object.prototype.hasOwnProperty.call(networkInfo, prop)) {
            nodes.add({id: count, label: prop});
            edges.add({from: 0, to: count});
            count++;
        }
    }

    let data = {
        nodes: nodes,
        edges: edges
    };
    let options = {height: "1000px"};
    network = new vis.Network(container, data, options);
}

async function addPeers(peers, nodeId) {
    let peerCount = 1;
    let limited = peers.slice(0, 10);

    for (let peer of limited) {
        let newNode = {id: count, label: "peer " + peerCount};
        nodes.add(newNode);
        edges.add({from: nodeId, to: count});
        count++;
        peerCount++;

        // Wait for 0.2 seconds
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}
function hasChildren(nodeId) {
    let connectedEdges = edges.get({
        filter: function (item) {
            return (item.from === nodeId);
        }
    });
    return connectedEdges.length > 0;
}

function removeChildren(nodeId) {
    // Find all child nodes of currentNodeId
    let childEdges = edges.get({
        filter: function (item) {
            return (item.from === nodeId);
        }
    });

    // Remove child nodes and their edges
    let childNodes = childEdges.map(edge => edge.to);
    edges.remove(childEdges);
    nodes.remove(childNodes);

    // Recursively remove children for each child node
    childNodes.forEach(childNodeId => {
        removeChildren(childNodeId);
    });
}

function addNodeWithLabel(label, parentId, shape) {
    nodes.add({ id: count, label: label, shape: shape });
    edges.add({ from: parentId, to: count++ });
}