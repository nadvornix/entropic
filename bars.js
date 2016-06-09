"use strict";


var RAND_HUE = 120;
function randomColor(){
    var color = new Color(0, 0, 0);
    color.brightness=1;
    color.saturation=0.6;
    RAND_HUE += 49;
    color.hue += RAND_HUE;
    return (color);
}

window.base = 2.0;


var dist = {
    '0': {p:0.2, color:randomColor()},
    '1': {p:0.1, color:randomColor()},
    '2': {p:0.2, color:randomColor()},
    '3': {p:0.5, color:randomColor()}
};
var order = [0,1,2,3]; // keys of dist

// var dist = {
//     '0': {p: 0.5, color:randomColor()},
//     '1': {p: 0.5, color:randomColor()}
// };
// var order = [0,1];


var height_of_bars = 400;
var bars_left_padding = 100;
var bars_top_padding = 100;
var ruler_dist = 15;
var size_of_marker = 6;

var shannon_size = 80;

///
var entropy_line = false;

var SELECTING = 1;
var HOVERING = 2;
var MODE = HOVERING;
var selected_posses=[]
//////


function logb(b, x){
    return Math.log(x) / Math.log(b);
}

function unit_size(base){
    return shannon_size/logb(base, 2);
}


function euclid_len(x,y){
    return Math.sqrt(x*x+y*y);
}

function compute_entropy(){
    //returns entropy of dist in bits
    var entropy = 0.0;
    var p;
    for (var key in dist){
        p = dist[key]['p'];
        if (!dist[key].deleteme){
            entropy += p * logb(2, p);
        }
    }
    return -entropy;
}

///




function line(x,y, dx, dy, color, strokeWidth){
    color = typeof color !== 'undefined' ? color : 'black';
    var path = new Path();
    path.strokeColor = color;
    path.strokeWidth = strokeWidth;
    var start = new Point(x, y);
    path.moveTo(start);
    path.lineTo(start + [ dx, dy ]);
    return path;
}

function line_with_endmarks(x ,y, dx, dy, color){
    line(x,y, dx, dy, color);


    var marker_ratio = size_of_marker/euclid_len(dx, dy);
    var marker_dx = dy*marker_ratio;
    var marker_dy = -dx*marker_ratio;

    line(x,y, marker_dx, marker_dy, color);
    line(x,y, -marker_dx, -marker_dy, color);

    var endx = x + dx;
    var endy = y + dy;
    line(endx,endy, marker_dx, marker_dy, color);
    line(endx,endy, -marker_dx, -marker_dy, color);
}

function write_text(x, y, text, justification, fontSize, fillColor){
    justification = typeof justification !== 'undefined' ? justification : 'right';
    fontSize = typeof fontSize !== 'undefined' ? fontSize : 12;
    fillColor = typeof fillColor !== 'undefined' ? fillColor : '#333';
    return new PointText({
            point: new Point(x, y),
            justification: justification,
            fontSize: fontSize,
            fillColor: fillColor,
            content: text
        });
}

function ruler(x,y, dx, dy, unit_size, unit){
    var color = "black";

    unit = typeof unit !== 'undefined' ? unit : '';

    write_text(x-10, y+6, unit);
    
    var ruler_len = euclid_len(dx, dy);

    var unit_ratio = unit_size/ruler_len;
    var unit_dx = dx*unit_ratio;
    var unit_dy = dy*unit_ratio;

    var marker_ratio = size_of_marker/ruler_len;
    var marker_dx = dy*marker_ratio;
    var marker_dy = -dx*marker_ratio;

    var i=0;
    var marker_x, marker_y;
    while (true){
        if (euclid_len(unit_dx * i, unit_dy * i) > ruler_len){
            break;
        }
        marker_x = x + unit_dx * i;
        marker_y = y + unit_dy * i;

        line(marker_x, marker_y, marker_dx, +marker_dy, color);
        line(marker_x, marker_y, -marker_dx, -marker_dy, color);

        text = new PointText({
            point: new Point(marker_x, marker_y+18),
            justification: 'center',
            fontSize: 12,
            fillColor: '#333'
        });
        text.content = i;

        if(i>0){
            line(marker_x, marker_y, -unit_dx, -unit_dy, color);
        }

        i += 1;
    }

}
///

function select(box){
    box.fillColor.saturation=1;
    box.strokeColor='black';
}

function unselect(box){
    box.fillColor.saturation=0.6;
    box.strokeColor='grey';
}

function humanize(x, size){
  return x.toFixed(size).replace(/\.?0*$/,'');
}

function draw_box(x, y, width, height, id, key){
    var poss=dist[key];
    var shape_strokeColor = 'grey';

    if (width<=1){
        width=4;
    }
    var point = new Point(x, y);
    var size = new Size(width, height);
    var shape = new Shape.Rectangle(point, size);

    var color = poss['color'];
    shape.fillColor = color;
    shape.strokeColor = shape_strokeColor;
    poss["shape"] = shape;
    // poss["leftBar"] = makeLeftBar(bars_left_padding - ruler_dist, bars_top_padding + height_so_far, height, i);

    var plabel = new PointText({
        point: new Point(point.x-ruler_dist-5, point.y+height/2),
        justification: 'right',
        fontSize: 12,
        fillColor: 'black'
    });
    plabel.content = humanize(poss['p'],6);
    poss['plabel'] = plabel;

    if (id > 0){
        poss['pmarker'] = line(point.x - (ruler_dist+size_of_marker), point.y, (2* size_of_marker), 0, "black");
    
    }

    shape.onMouseEnter = function (event) {
        select(event.target);
        if (MODE==SELECTING){
            for (var i=0; i<selected_posses.length; i+=1){
                if (selected_posses[i]['key']==key){
                    return;
                }
            }
            selected_posses.push({poss: poss, key:key, box:event.target});
        }
        
    };

    shape.onMouseLeave = function (event) {
        if (MODE==HOVERING){
            unselect(event.target);
        }
    };


    shape.onMouseDown = function (event) {
        MODE=SELECTING;
        selected_posses.push({poss: poss, key:key, box:event.target});
    }

    return shape;
}

view.onMouseDown = function (event) {
    MODE=SELECTING;
}

view.onMouseUp = function (event) {
    var k, key, poss, box, p;
    if (selected_posses.length==1){
        poss = selected_posses[0]['poss'];
        key = selected_posses[0]['key'];
        box = selected_posses[0]['box'];
        p = poss['p'];
        var new_p = p / window.base;
        poss.deleteme = true;
        var new_order=[];
        var j, new_id;

        for (j = 0; j < window.base; j += 1) {
            new_id = getUniqKey();
            dist[new_id] = {p: new_p, color: randomColor()};
            new_order.push(new_id);
        }

        var id = order.indexOf(key);
        var first_half = order.slice(0, id);
        var second_half = order.slice(id+1);
        order = first_half.concat(new_order).concat(second_half);

        unselect(box);
        erase(key);
    }
    else if (selected_posses.length >= 2){
        var p_combined = 0.0;

        var min_index = Infinity;
        for (k=0; k<selected_posses.length; k+=1){
            poss = selected_posses[k]['poss'];
            key = selected_posses[k]['key'];
            box = selected_posses[k]['box'];
            p_combined += poss['p'];
            erase(key);
            var index = order.indexOf(key);
            if (index<min_index){
                min_index=index;
            }

            var i = order.indexOf(key);
            if(i != -1) {
                order.splice(i, 1);
            }

        }
        var new_poss={p: p_combined, color: randomColor()};
        var new_key = getUniqKey();
        dist[new_key] = new_poss;
        var left_array = order.slice(0,min_index);
        var right_array = order.slice(min_index);
        left_array.push(new_key);
        left_array=left_array.concat(right_array);
        order=left_array;
        // debugger
    }
    redraw();

    selected_posses=[];
    MODE = HOVERING;
};

// function makeLeftBar(x, y, len, id){
//     var leftBar = new Path.Line({
//         from: [x, y],
//         to: [x, y+len],
//         strokeColor: '#ff0000',
//         strokeWidth: 10,
//         strokeCap: 'round',
//         opacity:0
//     });

//     var key = order[id];



//     leftBar.onMouseLeave = function (event) {
//         event.target.opacity=0;
//     };

//     leftBar.onMouseUp = function (event) {
//         var id = order.indexOf(key);
//         var poss = dist[key];
//         var p = poss['p'];
//         var new_p = p / base_used;
//         dist[key].deleteme = true;
//         var new_order=[];
//         var j, new_id;
//         for (j = 0; j < base_used; j+=1) {
//             new_id = getUniqKey();
//             dist[new_id] = {p: new_p, color: randomColor()};
//             new_order.push(new_id);
//         }
//         var first_half = order.slice(0, id);
//         var second_half = order.slice(id+1);
//         order = first_half.concat(new_order).concat(second_half);

//         redraw();
//         erase(key);

//     };
//     return leftBar;
// }

 
function getUniqKey(){
    NEW_ID+=1;
    return NEW_ID;
}

var NEW_ID = Object.keys(dist).length;


function erase(key){
    // better idea: first draw new, then delete old?
    var poss = dist[key];
    poss['shape'].remove();
    // poss['leftBar'].remove();
    poss['shape_total'].remove();
    poss['plabel'].remove();
    if ('pmarker' in poss){
        poss['pmarker'].remove();
    }
    delete dist[key];
}

function soft_erase(key){
    var poss = dist[key];
    if ("shape" in poss){
        poss['shape'].remove();
        delete poss['shape'];
    }
    if ("shape_total" in poss){
        poss['shape_total'].remove();
        delete poss['shape_total'];
    }
    if ("plabel" in poss){
        poss['plabel'].remove();
        delete poss['plabel'];
    }
    if ("pmarker" in poss){
        poss['pmarker'].remove();
        delete poss['pmarker'];
    }

}


function move_entropy_line(new_x){
    entropy_line.segments[0].point.x = new_x;
    entropy_line.segments[1].point.x = new_x;
}


function redraw() {
    var height_so_far = 0;
    var total_width_so_far = 0;

    var i, entropy_width;
    for (i=0; i < order.length; i+=1){
        var key = order[i];
        var poss = dist[key];
        var p = poss["p"];
        var height;
        var width;

        soft_erase(key);

        entropy_width = -p * logb(2, p) * shannon_size;
        
        var shape_strokeColor = 'grey';

        // var entropy_width = -p*logb(2, p) * shannon_size;
        var point_total = new Point(bars_left_padding + total_width_so_far, total_top);
        var size_total = new Size(entropy_width, 10);
        var shape_total = new Shape.Rectangle(point_total, size_total);
        shape_total.strokeColor = shape_strokeColor;
        poss["shape_total"] = shape_total;
        total_width_so_far += entropy_width;
        if ('shape' in poss){
            poss["shape_total"].fillColor = poss["shape"].fillColor;
        }



        // if (poss.drawn) {
        //     height = poss['shape'].getSize().height;
        //     height_so_far += height;
        //     continue;
        // }

        // plot rectangles
        height = p * height_of_bars;
        width = - logb(2, p) * shannon_size;
        poss["shape"] = draw_box(bars_left_padding, bars_top_padding + height_so_far, width, height, i, key);
        shape_total.fillColor = poss['color'];
        
        // var point = new Point(bars_left_padding, bars_top_padding + height_so_far);
        // var size = new Size(width, height);
        // var shape = new Shape.Rectangle(point, size);

        // var color = poss['color'];
        // shape.fillColor = color;
        // shape.strokeColor = shape_strokeColor;
        // shape_total.fillColor = color;
        // poss["shape"] = shape;

        // poss["leftBar"] = makeLeftBar(bars_left_padding - ruler_dist, bars_top_padding + height_so_far, height, i);


        // label of probability on left
        // todo: remember this to have ability to edit it
        

        height_so_far += height;
        poss.drawn = true;

        

    }
    
    //drawing line with entropy of distribution
    var entropy = compute_entropy();
    var entropy_line_x = entropy * shannon_size + bars_left_padding;

    if (!entropy_line) {
        entropy_line = line(entropy_line_x, bars_top_padding+height_of_bars+8, 0, 8*ruler_dist, "red", 3);
    }
    else{
        move_entropy_line(entropy_line_x);
    }

}

//left ruler
line_with_endmarks(bars_left_padding-ruler_dist, bars_top_padding, 0, height_of_bars);

//bottom rulers
ruler(bars_left_padding, bars_top_padding+height_of_bars+ruler_dist * 2, 444, 0, shannon_size, "shannons");
ruler(bars_left_padding, bars_top_padding+height_of_bars+ruler_dist * 4, 444, 0, unit_size(Math.E), "nats");
ruler(bars_left_padding, bars_top_padding+height_of_bars+ruler_dist * 6, 444, 0, unit_size(3), "trits");
ruler(bars_left_padding, bars_top_padding+height_of_bars+ruler_dist * 8, 444, 0, unit_size(10), "harts");

var total_top = bars_top_padding+height_of_bars+8;
var text = new PointText({
        point: new Point(bars_left_padding-10, total_top+10),
        justification: 'right',
        fontSize: 12,
        fillColor: '#333'
    });
    text.content = "sum of entropy";

redraw();

// tool1 = new Tool();
// tool1.onMouseDown = genOnMouseDown


// $('#base').on('change', function() {
//     base_used =parseFloat(this.value);
//     console.log(base_used);
// });

