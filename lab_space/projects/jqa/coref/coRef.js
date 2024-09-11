
// Utilities.

function setProgressValues(selector) {
    $(selector).css({
        'left': '20%',
        'right': '20%'
    });
}

function formatNumbers(d) {
    /*
    Function that rounds number to 2 significant digits, with no grouping for thousnads. 

    Inputs: 
        d: number to be rounded
    */
    return d3.format('.2r')(d);
}

function UpdateFilters(dataset,node,link,label){
    /* 
    Function run whenever a slider value is changed. Updates the nodes visible to only be those that 
    meet all the criteria below. M
    
    Might it be worthwhile to add advanced logical filtering (ie AND/OR between different sliders)?
    */

    console.log(
            "Degree Min:" + FilterParams.DegreeMin + 
        '\n' +"Degree Max:" +FilterParams.DegreeMax+
        '\n' +
        '\n'+ "Modularity Min:" + FilterParams.ModuMin + 
        '\n' +"Modularity Max:" +FilterParams.ModuMax +
        '\n' +
        '\n' +"Betweenness Min:" +FilterParams.BetMin +
        '\n' +"Betweenness Max:" +FilterParams.BetMax + 
        '\n' +
        '\n' +"Eigenvector Min:" +FilterParams.EigMin + 
        '\n' +"Eigenvector Max:" +FilterParams.EigMax  
    );


    // Right now, it does this filtering for every single attribute (min and max) every time any (possible unrelated) is udated. Is there a better way? 
    let FilteredNodes = dataset.nodes.map(d => Object.create(d))
    .filter(function (d) { return d.degree >= FilterParams.DegreeMin })
    .filter(function (d) { return d.degree <= FilterParams.DegreeMax })
    .filter(function (d) { return d.modularity >= FilterParams.ModuMin })
    .filter(function (d) { return d.modularity <= FilterParams.ModuMax })
    .filter(function (d) { return d.betweenness >= FilterParams.BetMin })
    .filter(function (d) { return d.betweenness <= FilterParams.BetMax })
    .filter(function (d) { return d.eigenvector >= FilterParams.EigMin })
    .filter(function (d) { return d.eigenvector <= FilterParams.EigMax });

    // Gets only the Ids of the filtered Nodes 
    NewNodes = FilteredNodes.map(function(FilteredNodes) { return FilteredNodes.id; });


    // If the node is in the list, it is visible, if it is not, it isn't 
     node.style('visibility', function(o) {
            return NewNodes.includes(o.__proto__.id) ? "visible" : "hidden";
    });

    // If both the target and source node are unfiltered, the links will be visible
    link.style('visibility',function(o){
            return NewNodes.includes(o.__proto__.source.id) && NewNodes.includes(o.__proto__.target.id) ? "visible" : "hidden";
    });

    // If a node is visible, its label will be as well
    label.text( d => d.id).attr('visibility', function(o) {
            // If a node is neighbor with source, show text -- if not, don't.

            if (NewNodes.includes(o.__proto__.id) && o.__proto__.degree > 3) {
                return "visible";
            }
            
            else {
                return "hidden";
            }
    });     
}


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



function graph(filepath){

     FilterParams = {} // Filter params dict
     adjlist = [] // Adjacency list for highlighting connected nodes.

// "data" now holds the JSON data for building the grapgh
d3.json(filepath).then(data => {

    d3.selectAll("svg > *").remove();

    // Build constants. (window size and length of transitions)
    let margin = {top: 30, right: 30, bottom: 30, left: 30},
        width = 850, height = 600, duration = 300;

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

    // Below, all the sliders are built for filtering 

        // Degree slider 

        minimum_deg  = d3.extent(data.nodes.map(node => node.degree))[0];
        maximum_deg = d3.extent(data.nodes.map(node => node.degree))[1];

        document.getElementById('deg-minnum').value = minimum_deg;
        document.getElementById('deg-maxnum').value = maximum_deg;
        document.getElementById('deg-minrange').min = minimum_deg;

        document.getElementById('deg-minrange').max = maximum_deg;

        document.getElementById('deg-maxrange').min = minimum_deg;
        document.getElementById('deg-maxrange').max = maximum_deg;

        document.getElementById('deg-minrange').value = minimum_deg;
        document.getElementById('deg-maxrange').value = maximum_deg;
            
    
        // The default for the filtering params are set as the max.min value in the data
        FilterParams.DegreeMin = document.getElementById('deg-minrange').value;
        FilterParams.DegreeMax = document.getElementById('deg-maxrange').value;

         // Mod slider 

        minimum_mod  = d3.extent(data.nodes.map(node => node.modularity))[0];
        maximum_mod = d3.extent(data.nodes.map(node => node.modularity))[1];

        document.getElementById('mod-minnum').value = minimum_mod;
        document.getElementById('mod-maxnum').value = maximum_mod;

        document.getElementById('mod-minrange').min = minimum_mod;
        document.getElementById('mod-minrange').max = maximum_mod;

        document.getElementById('mod-maxrange').min = minimum_mod;
        document.getElementById('mod-maxrange').max = maximum_mod;

        document.getElementById('mod-minrange').value = minimum_mod;
        document.getElementById('mod-maxrange').value = maximum_mod;
            
    
        // The default for the filtering params are set as the max.min value in the data
        FilterParams.ModuMin = document.getElementById('mod-minrange').value;
        FilterParams.ModuMax = document.getElementById('mod-maxrange').value;


    // This is a (possibly unneasarily complicated) way to round to the ceiling of the second decimal place. Floor is needed as there may be a minimum of a very small non-zero number
    // This is to avoid having 3 deceimal places in the filter condition but also making sure it is close to the actual max value. 
    maximum_bet = parseFloat((d3.extent(data.nodes.map(node => node.betweenness))[1]+.01).toString().substring(0, (d3.extent(data.nodes.map(node => node.betweenness))[1]+.01).toString().indexOf('.')+3));
    minimum_bet = d3.extent(data.nodes.map(node => node.betweenness))[0];

        // Bet slider 
        document.getElementById('bet-minnum').value = minimum_bet;
        document.getElementById('bet-maxnum').value = maximum_bet;

        document.getElementById('bet-minrange').min = minimum_bet;
        document.getElementById('bet-minrange').max = maximum_bet;

        document.getElementById('bet-maxrange').min = minimum_bet
        document.getElementById('bet-maxrange').max = maximum_bet;

        document.getElementById('bet-minrange').value = minimum_bet;
        document.getElementById('bet-maxrange').value = maximum_bet;
        
    
        // The default for the filtering params are set as the max.min value in the data
        FilterParams.BetMin = document.getElementById('bet-minrange').value;
        FilterParams.BetMax = document.getElementById('bet-maxrange').value;

         // Eig slider 

        // This is a (possibly unneasarily complicated) way to round to the ceiling of the second decimal place. Floor is needed as there may be a minimum of a very small non-zero number
        // This is to avoid having 3 deceimal places in the filter condition but also making sure it is close to the actual max value. 
        maximum_eig = parseFloat((d3.extent(data.nodes.map(node => node.eigenvector))[1]+.01).toString().substring(0, (d3.extent(data.nodes.map(node => node.eigenvector))[1]+.01).toString().indexOf('.')+3));
        minimum_eig = Math.floor(d3.extent(data.nodes.map(node => node.eigenvector))[0]);
       
        document.getElementById('eig-minnum').value = minimum_eig;
        document.getElementById('eig-maxnum').value = maximum_eig;

        document.getElementById('eig-minrange').min = minimum_eig;
        document.getElementById('eig-minrange').max = maximum_eig;

        document.getElementById('eig-maxrange').min = minimum_eig;
        document.getElementById('eig-maxrange').max = maximum_eig;

        document.getElementById('eig-minrange').value = minimum_eig;
        document.getElementById('eig-maxrange').value = maximum_eig;
            
        // The default for the filtering params are set as the max.min value in the data
        FilterParams.EigMin = document.getElementById('eig-minrange').value;
        FilterParams.EigMax = document.getElementById('eig-maxrange').value;
        ///////


    // Draw initial graph.
    // chart(data);

    // Draw network function.
    //function chart(dataset) {
        /*
        Draws the network graph 
        */

        // Creates an array, each entry being info on a single node/link
        let nodes = data.nodes.map(d => Object.create(d));

        // This value will change when filtered, but it is set to default at all nodes 
        NewNodes = nodes.map(function(nodes) { return nodes.id; });
        
        // ALl links are drawn for now, then the opacity of irrelevant ones is changed later
        let links = data.links.map(d => Object.create(d));
             
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

     //};

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

        label
            .text( d => d.id)
            .attr('visibility', function(o) {
                // If a node is neighbor with source, show text -- if not, don't.
                return neigh(source, o.__proto__.id) && NewNodes.includes(o.__proto__.id) ? "visible" : "hidden";
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
                .style('opacity', 0.7) // lowered opacatiy so nodes/links behind can be seen 
                
                // Changed to tie it to mouse movement because this stops it from getting wonky when zoom/page view is changed. 
                .style("left", (event.x) + "px")
                .style("top", (event.y) + "px");
            
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
            .style("left", (event.x) + "px")
            .style("top", (event.y) + "px")
    });

    node.on('mouseout', function () { // hides tooltip when not highlighting node
        tooltip.transition(duration).style('opacity', 0);

        // First, hide text that is tied to a filtered away node
        label
        .text( d => d.id)
        .attr('visibility', function(o) {
            // If a node is neighbor with source, show text -- if not, don't.
            return NewNodes.includes(o.__proto__.id) ? "visible" : "hidden";
        });

        // Then, only display on the remaining if degree is above 3
        label
            .text( d => {if (d.degree > 3.0) {return d.id} else {return ''}} )
            .attr('display', 'block');

        node.style('opacity', 1);

        // Resets the link to their original (possibly filtered) opacity 
        link.style('opacity', 1);
    
    });
    
    // Slider Listening Events

    // Listens for DEGREE minrange slider value change
    d3.select("#deg-minrange").on("change", function(){

        // When it is changed, the filterparams value is changed accordingly 
        FilterParams.DegreeMin = document.getElementById('deg-minrange').value;
        // UpdateFilters function is then ran with updated value
        UpdateFilters(data,node,link,label);
                
    });
    
    // Listens for DEGREE maxrange slider value change
    d3.select("#deg-maxrange").on("change", function(){
    
        // When it is changed, the filterparams value is changed accordingly 
        FilterParams.DegreeMax = document.getElementById('deg-maxrange').value;
        // UpdateFilters function is then ran with updated value
        UpdateFilters(data,node,link,label);
                
    
    });

      // Listens for MODULARITY minrange slider value change
    d3.select("#mod-minrange").on("change", function(){

        // When it is changed, the filterparams value is changed accordingly 
        FilterParams.ModuMin = document.getElementById('mod-minrange').value;
        // UpdateFilters function is then ran with updated value
        UpdateFilters(data,node,link,label);
                
    });
    
    // Listens for MODULARITY maxrange slider value change
    d3.select("#mod-maxrange").on("change", function(){
    
        // When it is changed, the filterparams value is changed accordingly 
        FilterParams.ModuMax = document.getElementById('mod-maxrange').value;
        // UpdateFilters function is then ran with updated value
        UpdateFilters(data,node,link,label);
                
    
    });

    // Listens for BETWEENNESS maxrange slider value change
    d3.select("#bet-minrange").on("change", function(){
    
        // When it is changed, the filterparams value is changed accordingly 
        FilterParams.BetMin = document.getElementById('bet-minrange').value;
        // UpdateFilters function is then ran with updated value
        UpdateFilters(data,node,link,label);
                    
     });
    
    // Listens for BETWEENNESS maxrange slider value change
    d3.select("#bet-maxrange").on("change", function(){
        
        // When it is changed, the filterparams value is changed accordingly 
        FilterParams.BetMax = document.getElementById('bet-maxrange').value;
        // UpdateFilters function is then ran with updated value
        UpdateFilters(data,node,link,label);
                      
    });

    // Listens for EIGENVECTOR maxrange slider value change
    d3.select("#eig-minrange").on("change", function(){
    
    // When it is changed, the filterparams value is changed accordingly 
    FilterParams.EigMin = document.getElementById('eig-minrange').value;
    // UpdateFilters function is then ran with updated value
    UpdateFilters(data,node,link,label);
                
    });

    // Listens for EIGENVECTOR maxrange slider value change
      d3.select("#eig-maxrange").on("change", function(){
    
        // When it is changed, the filterparams value is changed accordingly 
        FilterParams.EigMax = document.getElementById('eig-maxrange').value;
        // UpdateFilters function is then ran with updated value
        UpdateFilters(data,node,link,label);
        
    });

});

}

