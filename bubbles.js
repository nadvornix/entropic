
"use strict";
var graph = new Springy.Graph();

function logb(b, x){
    return Math.log(x) / Math.log(b);
}

var dennis = graph.newNode({
    label: 'Dennis',
    ondoubleclick: function() { console.log("Hello!"); }
});
var michael = graph.newNode({label: 'Michael'});
var jessica = graph.newNode({label: 'Jessica'});
var timothy = graph.newNode({label: 'Timothy'});
var barbara = graph.newNode({label: 'Barbara'});
var franklin = graph.newNode({label: 'Franklin'});
var monty = graph.newNode({label: 'Monty'});
var james = graph.newNode({label: 'James'});
var bianca = graph.newNode({label: 'Bianca'});

// debugger

graph.newEdge(dennis, michael, {color: '#00A0B0'});
// graph.newEdge(michael, dennis, {color: '#6A4A3C'});
// graph.newEdge(michael, jessica, {color: '#CC333F'});
// graph.newEdge(jessica, barbara, {color: '#EB6841'});
// graph.newEdge(michael, timothy, {color: '#EDC951'});
// graph.newEdge(franklin, monty, {color: '#7DBE3C'});
// graph.newEdge(dennis, monty, {color: '#000000'});
// graph.newEdge(monty, james, {color: '#00A0B0'});
// graph.newEdge(barbara, timothy, {color: '#6A4A3C'});
// graph.newEdge(dennis, bianca, {color: '#CC333F'});
//    graph.newEdge(bianca, monty, {color: '#EB6841'});

jQuery(function(){
    var springy = window.springy = jQuery('#myCanvas').springy({
        graph: graph,
        nodeSelected: function(node){
            // debugger;
            var adjacent_nodes = [];
            graph.edges.forEach(function(e) {
                if (e.source.id === node.id) {
                    adjacent_nodes.push(e.source);
                }
                if (e.target.id === node.id) {
                    adjacent_nodes.push(e.target);
                }
            }, graph);

            var old_position = graph.layout.point(node).p;
            
            var new_nodes=[];
            var new_node;
            for (var i=0; i<2; i+=1){
                new_node = graph.newNode({label: 'Michael'+i});
                graph.layout.point(new_node).p = old_position;
                // for (var j=0; j < adjacent_nodes.length; j+=1){
                //     graph.newEdge(new_node, adjacent_nodes[j], {color: '#EDC951'});
                //     alert(adjacent_nodes[j]);
                //     // graph.newEdge(adjacent_nodes[j], new_node, {color: '#EDC951'});
                // }
                new_nodes.push(new_node);
            }
            graph.removeNode(node);
        }
    });
});