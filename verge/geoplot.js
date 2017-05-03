var h = 400;
var w = 600;

var num_predict_in_districts=null;
var total_in_district = null;

var svgGeoPlot =
    d3.select("#geo")
    .append("svg")
    .attr("width", w)
    .attr("height", h);  // to be changed later

// Define the div for the tooltip
var div = d3.select("#geo").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


var projection = d3.geo.mercator()
    .center([-122.433701, 37.767683])
    .scale(125000)
    .translate([w / 2, h / 2]);

var path = d3.geo.path()
.projection(projection);


var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    var private_val;
    var public_val;
    var total_private;
    var total_public;
    console.log("HERNA!!!");
    console.log(d.properties.DISTRICT);
    if(num_predict_in_districts === null){
        private_val = 0;
        public_val = 0;
    }
    else{
        private_val =num_predict_in_districts[d.properties.DISTRICT].private;
        public_val =num_predict_in_districts[d.properties.DISTRICT].public;
    }
    if(total_in_district === null){
        total_private = 0;
        total_public = 0;
    }
    else{
        total_private = total_in_district[d.properties.DISTRICT].private;
        total_public =  total_in_district[d.properties.DISTRICT].public;
    }

    return "<strong>District: </strong>" + "<span style='color:#44da82'> "+ d.properties.DISTRICT +"</span>"
        + "<br/>" + "<br/>" +"<strong>True number of graffiti cases: </strong>"
        + "<br/>" + "<strong>   Number of private: </strong>"  +"<span style='color:#44da82'>"+ total_private +"</span>"
        + "<br/>" + "<strong>   Number of public: </strong>"  +"<span style='color:#44da82'>"+total_public +"</span>"
        + "<br/>" + "<strong>   Total number of graffiti cases: </strong>"  +"<span style='color:#44da82'>"+ (Number(total_private)+Number(total_public)) +"</span>"
        + "<br/>" + "<br/>" +"<strong>Predictions: </strong>"
        + "<br/>" + "<strong>   Number of private: </strong>"  +"<span style='color:#44da82'>"+ private_val +"</span>"
        + "<br/>" + "<strong>   Number of public: </strong>"  +"<span style='color:#44da82'>"+public_val +"</span>"
        + "<br/>" + "<strong>   Total number of predictions: </strong>"  +"<span style='color:#44da82'>"+(Number(public_val) + Number(private_val)) +"</span>";
  });

  svgGeoPlot.call(tip);

d3.json("https://raw.githubusercontent.com/suneman/socialdataanalysis2017/master/files/sfpddistricts.geojson", function(json) {
    svgGeoPlot.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d){
            if (d.properties.DISTRICT === "CENTRAL"){
                return "rgb(200, 40, 40)";
            }
            else{
                return "rgb(200,200,200)";
            }

        })
    .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      ;

d3.csv("totalInstaceInDistict.csv", function(error,tota_count_in_districts){
    if(error){
        console.log(error);
    } else{

           var total_count = new Object();
                for (var i = 0; i < tota_count_in_districts.length; i++) {
                    total_count[tota_count_in_districts[i].district] = tota_count_in_districts[i];
                }
                total_in_district  = total_count;
    }
d3.csv("Copy-of-neighbourhoods.csv", function(error, data) {
        if (error) {
            console.log(error);
        } else {
            //set data on right format
            for (var i = 0; i < data.length; i++) {
                data[i].lat = Number(data[i].lat);
                data[i].lon = Number(data[i].lon);
            }

            //here we write the neigbourhood name on the geoplot
            svgGeoPlot.selectAll("text")
                .data(data)
                .enter()
                .append("text")
                .text(function(d) {
                    return d.name;
                })
                .attr("x", function(d) {
                    return projection([d.lon, d.lat])[0];
                })
                .attr("y", function(d) {
                    return projection([d.lon, d.lat])[1];
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", "15px")
                .attr("fill", "beige");

        }
    });
loadPoints();
});
});

function loadPoints(){
    d3.csv("Predict_test.csv", function(error, data) {
        if (error) {
            console.log(error);
        } else {
            //set data on right format
            for (var i = 0; i < data.length; i++) {
                data[i].lat = Number(data[i].lat);
                data[i].lon = Number(data[i].lon);
            }
        }

});
}

function getColor(count_public, count_private){
    // calculate the RGB value to corresponding ratio of forcasted, private vs public

        r_ratio = count_public/(count_private+count_private);
        b_ratio = count_private/(count_private+count_private);


    R = Math.floor(150* r_ratio);
    // G is always the same
    B = Math.floor(200*b_ratio);
    color = "rgb(" +String(R) + ",70 ," + String(B) + ")";
    return color;

}




 d3.selectAll("button")
               .on("click", function(){
                    console.log(this.id);

        if(this.id === "original"){
            num_predict_in_districts=null;
            svgGeoPlot.selectAll("path")
                        .style("fill", "rgb(200,200,200)");
        } else{
        d3.csv(this.id ,  function(error, data) {
            if (error) {
                console.log(error);
            } else {
                // the object contains the name of the district as key, and the origianl obj as value
                 // then you can get the value with the key and calculate the color of the district
                 // you can use [] notion on file in javascript..
                var pred_data = new Object();
                for (var i = 0; i < data.length; i++) {
                    pred_data[data[i].district] = data[i];
                    //data[i].lat = Number(data[i].lat);
                    //data[i].lon = Number(data[i].lon);
                }

               num_predict_in_districts = pred_data; // so we can use the data in the tooltip

            }

                //var myObj = new Object;

                svgGeoPlot.selectAll("path")
                        .style("fill", function(d){

                            return getColor(Number(pred_data[d.properties.DISTRICT].public), Number(pred_data[d.properties.DISTRICT].private));

                            /*if (d.properties.DISTRICT === "MISSION"){
                                return getColor(50,70);//"rgb(40, 200, 40)";
                            }
                            else if(d.properties.DISTRICT === "CENTRAL"){
                                return getColor(300,2);
                            }
                            else{
                                return "rgb(20,20,30)";
                            }*/
                        });


                        });


}


                        });

