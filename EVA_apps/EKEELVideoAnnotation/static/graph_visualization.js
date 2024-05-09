
/* Visualization of the graph */
function showNetwork(concepts, relations, container_id){
    // create an array with nodes
    var nodes = new vis.DataSet([]);
    // create an array with edges
    var edges = new vis.DataSet([]);


    for(let key in concepts)
        nodes.add({id:concepts[key], label:concepts[key]})

    for(let key in relations)
         edges.add({from:relations[key].prerequisite, to:relations[key].target})


    // create a network
    var container = document.getElementById(container_id);

    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        edges: {
            color: "#000000",
            hoverWidth: 100,
            smooth: true,
            arrows: {
              to: {
                enabled: true,
                scaleFactor: 0.5,
                type: "arrow"
              }
            }
          },
      nodes: {
        shape: "dot",
        size: 10,
        opacity: 0.9,
        mass:1
      },
      layout: {
        randomSeed: 50, //fixed seed --> always the same nodes positions
        improvedLayout: true,
        hierarchical: false,
        clusterThreshold: 1000
      },
      physics: {
        stabilization: true,
        forceAtlas2Based: {
          avoidOverlap: 1,
          springLength: 400
        }
      },

      manipulation: {
        enabled: false
      }
    };

    // initialize your network!
    var network = new vis.Network(container, data, options);

    /*network.on("selectEdge", function (params) {
        console.log(params)
        network.interactionHandler._checkShowPopup(params.pointer.DOM);
    });*/

    return network
}