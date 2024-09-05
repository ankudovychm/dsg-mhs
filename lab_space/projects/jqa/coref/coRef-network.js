// Utilities.
function formatNumbers(d) {
    /*
    Function that rounds number to 2 significant digits, with no grouping for thousnads. 

    Inputs: 
        d: number to be rounded
    */
    return d3.format('.2r')(d);
}

let adjlist = [] // Adjacency list for highlighting connected nodes.

function neigh(a, b) {
    /* 
    Function that checks if two nodes are neighbors, or the same node

    Inputs: 
        a: Node 1
        b: Mode 2

    */

    // Checks if a = b, OR if the adjlist includes the connection a-b OR b-a
    return a == b || adjlist.includes(a + '-' + b) || adjlist.includes(b + '-' + a);
}


/* 
Build drag event handlers

These allow the nodes to not be affected by the "gravity" of the sim while being dragged
*/

function dragStarted(d, event) {
    /*
    At start of drag, the x and y coordinate are fixed (fx, fy) to their starting point

    Inputs: 
        d: Draggable node 
        event: The drag event

    */
    if (!event.active) window.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}
  
function dragged(d, event) {
     /*
    While dragging, the fixed location of the node is set to the info of the drag event

    Inputs: 
        d: Draggable node 
        event: The drag event

    */
    d.fx = event.x;
    d.fy = event.y;
    console.log(d.fy);
}
  
function dragEnded(d, event) {
    /*
    After the drag ends, the fixed value is set to be empty again. 

    Inputs: 
        d: Draggable node 
        event: The drag event

    */
    if (!event.active) window.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}


// JSON data path
var JSON_filepath = 'data/JQA_coRef-network.json';

// Filter Params 

// Degree
var deg_min = 5
var deg_max = 30

// Community 
var com_min = 0 
var com_max = 1 


// Betweeness 
var bet_min = .1
var bet_max = .3

// Eigenvector
eig_min = .1
eig_max = .3

// "data" now holds the JSON data for building the grapgh
d3.json(JSON_filepath).then(data => {
     
    // Build constants. (window size and length of transitions)
    let margin = {top: 30, right: 30, bottom: 30, left: 30},
        width = 960, height = 700, duration = 300;

    // Build container.
    const svg = d3.select('.network')
    .append('svg')
        .attr("height", height + margin.top + margin.bottom) // Contained.
        .attr("width", width + margin.right + margin.left)
    .call(d3.zoom()
        .scaleExtent([0.15, 6])
        .on("zoom", function (event) { // Add zooming.
            svg.attr("transform", event.transform)
        }))
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Coordinates of SVG boundaries.
    const pos = svg.node().getBoundingClientRect();
    console.log(pos);

    // Build elements.
    svg.append('g').attr('class', 'links'); // links
    svg.append('g').attr('class', 'nodes'); // nodes
    svg.append('g').attr('class', 'labels'); // labels

    // Build tooltip.
    const tooltip = d3.select('.network') // d3.select('.tooltip-container')
        .append('div')
            .attr('class', 'network-tooltip')
            .style('opacity', 0)
            .style('position', 'fixed')
            .attr('pointer-events', 'none');

    const toolHeader = tooltip
        .append('h3')
        .attr('class', 'toolHeader')
        .attr('pointer-events', 'none');

    const toolBody = tooltip
        .append('p')
        .attr('class', 'toolBody')
        .attr('pointer-events', 'none');

    // Build first-step for focus/unfocus: adjlist + neigh()
    data.links.forEach(function(d) {
        adjlist.push(d.source + '-' + d.target);
    });

    // Build node & font scales.
    let nodeColor = d3.scaleSequential(
        d3.schemeSet2
        // d3.schemeTableau10
    )
    // Sets the range of values as the min and max modularity (repeats below)
    .domain(d3.extent(data.nodes.map(node => node.modularity)));

    let nodeScale = d3.scaleLinear()
        .domain(d3.extent(data.nodes.map(node => node.degree)))
        .range([25, 100]);
    
    let fontSizeScale = d3.scaleLinear()
        .domain([0, d3.max(data.nodes.map(node => node.degree))])
        .range([16, 32]);

    let edgeScale = d3.scaleLinear()
        .domain(d3.extent(data.links.map(link => link.weight)))
        .range([3, 20])

    // Instantiate variables for later use.
    let link, node, label;

    // Build force simulation. Mostly boilerplate from docs
    // Documentation: https://devdocs.io/d3~7/d3-force#forcesimulation
    window.simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody()
            .strength(-1000)
            .distanceMin(100)
            .distanceMax(1000)
        )
        .force("center", d3.forceCenter( width/2, height/2 ))
        .force("gravity", d3.forceManyBody()
            .strength()
        )
        .force("collision", d3.forceCollide()
            .radius(d => d.r * 2)
        )
        .force('center', d3.forceCenter(width / 2, height / 2));


    // Add nodes, links, & labels to simulation and tell them to move in unison with each tick.
    window.simulation
        .nodes(data.nodes, d => d.id)
        .force('collide', d3.forceCollide().radius(d => nodeScale(d.degree) + 10))
        .force("link", d3.forceLink(data.links)
            .id(d => d.id)
            .distance( height / data.nodes.length)
            // .distance(100)
        )
        .on("tick", (d) => { // tick function.

            label
                .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }
    );

    // Draw initial graph.
    chart(data);

    // Draw network function.
    function chart(dataset) {
        /*
        Draws the network graph 


        */

        // Creates an array, each entry being info on a single node/link
        let nodes = dataset.nodes.map(d => Object.create(d)).filter(function (d) { return d.degree >= 15 });
        let links = dataset.links.map(d => Object.create(d));

        // links = links.filter(function (d) { return d.weight >= 0.5 });
        // nodes = nodes.filter( (d) => links.find( ({source}) => d.id === source));
        // links = links.filter( (d) => nodes.find( ({id}) => d.id === id) );
        
        // Draw links.
        link = d3.select('.links') // Selects all links 
            .selectAll('line')
            .data(links)
            .join( // Handles enter, update, exit selection 
                enter => enter.append('line')
                    .attr('class', 'edge')
                    
                    // Sets the starting and ending coordinates for links
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y)

                    // Sets the color and width of each line 
                    .attr('stroke', d => nodeColor(d.source['modularity']) )
                    .attr('stroke-width', d => edgeScale(d.__proto__.weight) )
                    .attr('opacity', 0.6),
                
                update => update, // Unchanged
                exit => exit.transition().remove() // When links no longer have corrosponding data points, they fade out
            );

        // Draw nodes.
        node = d3.select('.nodes')
            .selectAll("circle")
            .data(nodes)
            .join(
                enter => enter.append('circle')
                    .attr('class', 'node')

                    // Sets coordinates of center of node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)

                    // Sets size and color 
                    .attr('r', (d) => nodeScale(d.degree))
                    .attr('fill', (d) => nodeColor(d.modularity)),

                update => update, // Unchanged 
                exit => exit.transition().remove() // Will fade out on exit 
            )

            // Makes the dragging work 
            .call(d3.drag()
                .on("start", dragStarted)
                .on("drag", dragged)
                .on("end", dragEnded)
            );


        // Write labels.
        label = d3.select('.labels')
            .selectAll('text')
            .data(nodes)
            .join(
                enter => enter.append('text')
                        .attr('class', 'label')
                        .attr('pointer-events', 'none')
                    // Label is shown if degree over 3.0, and it is scaled based off degree    
                    .text( d => {if (d.degree > 3.0) {return d.id} else {return ''}} )
                        .attr('font-size', d => fontSizeScale(d.degree)),

                update => update // If text id updated, handled the same way 
                    .text( d => {if (d.degree > 3.0) {return d.id} else {return ''}} )
                        .attr('font-size', d => fontSizeScale(d.degree)),

                exit => exit.transition().remove() // transition out 
            )
        
        // Reheat simulation. (Gravity) 
        window.simulation.alphaDecay(0.01).restart();

        // Filter out links 
        window.filteredNodeIds = new Set(nodes.map(node => node.id));

        link.style('opacity', function(o) {
            // Check if either the source or target of the link is in the filtered nodes list
            return window.filteredNodeIds.has(o.__proto__.source.id) && window.filteredNodeIds.has(o.__proto__.target.id) ? 1 : 0.0; // Full opacity if connected to a filtered node
        });
     };

    // Move mouse over/out.
    node.on('mouseover', function(event, d, i) { // Each node listens for mouseover 

        // Gets the ID of the node that is highlighted over 
        let source = d3.select(event.target).datum().__proto__.id;

        node.style('opacity', function(o) {
            // If node (o) is neighbor of source, opacity is 1, otherwise it is set to .1
            return neigh(source, o.__proto__.id) ? 1: 0.1;
        });

        
        link.style('opacity', function(o) {
            // If link (o)'s source or target is the selected node, then opacity is 1, otherwise it is 0
            return o.__proto__.source.id == source || o.__proto__.target.id == source ? 1 : 0.2;
        });

        link.style('opacity',function(o) { 

            // Bool expression that returns T/F of if a given node is a neighbor of source node
            let isNeigh = o.__proto__.source.id == source || o.__proto__.target.id == source;

            // Bool expression that returns T/F if a links target and source are BOTH visible
            let inFiltered = window.filteredNodeIds.has(o.__proto__.source.id) && window.filteredNodeIds.has(o.__proto__.target.id);

           // If the node is a neighboor and in the filtered list, fully visible
            if (isNeigh && inFiltered) {
                return 1;
            }
            
            // If the node is not neighboor but in the filtered list, dimmed
            else if (!isNeigh && inFiltered){
                return 0.2;
            }
        
            // Otherwise, return 0 
            else {
                return 0;
            }
        });

        label
            .text( d => d.id)
            .attr('display', function(o) {
                // If a node is neighbor with source, show text -- if not, don't.
                return neigh(source, o.__proto__.id) ? "block" : "none";
            });

        // Gather tooltip info.
        let nodeInfo = [
            ['Degree', formatNumbers(d.degree, 2)],
            ['Community', formatNumbers(d.modularity, 2)],
            ['Betweenness', formatNumbers(d.betweenness, 3)],
            ['Eigenvector', formatNumbers(d.eigenvector, 3)],
        ];

        tooltip
            .transition(duration) // Sets attributes like transition duration and location. 
                .attr('pointer-events', 'none')
                .style('opacity', 0.97)
                .style("left", (pos.x) + "px")
                .style("top", (pos.y) + "px");
            
        toolHeader
            .html(d.id)
            .attr('pointer-events', 'none');

        toolBody
            .selectAll('p')
            .data(nodeInfo)
            .join('p')
                .html(d => `${d[0]}: ${d[1]}`)
                .attr('pointer-events', 'none');

        window.simulation.alphaTarget(0).restart();
    });

    node.on('mousemove', function(event) {
        tooltip
            .style("left", (pos.x) + "px")
            .style("top", (pos.y) + "px")
    })

    node.on('mouseout', function () { // hides tooltip when not highlighting node
        tooltip.transition(duration).style('opacity', 0);

        // Unfocus -- Returns all nodes/links/text to default once mouse leaves
        label
            .text( d => {if (d.degree > 3.0) {return d.id} else {return ''}} )
            .attr('display', 'block');

        node.style('opacity', 1);

        // Resets the link to their original (possibly filtered) opacity 
        link.style('opacity', function(o) {
            // Check if either the source or target of the link is in the filtered nodes list
            return window.filteredNodeIds.has(o.__proto__.source.id) && window.filteredNodeIds.has(o.__proto__.target.id) ? 1 : 0.0; // Full opacity if connected to a filtered node
        });

    })

});
