/**
 * Some useful links for choropleths in D3:
 *
 * Basic Choropleths:
 * https://d3-graph-gallery.com/graph/backgroundmap_basic.html
 * https://d3-graph-gallery.com/graph/choropleth_basic.html
 *
 * D3 GEO Projections:
 * https://d3-wiki.readthedocs.io/zh_CN/master/Geo-Projections/
 * https://github.com/d3/d3-geo-projection#projections
 *
 * US Counties Map from Topological Dataset:
 * https://observablehq.com/@d3/choropleth
 *
 * D3 US Map Choropleth Examples:
 * http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922
 * https://observablehq.com/@d3/u-s-map
 * http://bl.ocks.org/dougdowson/9832019
 * https://observablehq.com/@mkfreeman/topojson-simplifier
 * https://observablehq.com/@d3/bivariate-choropleth
 * https://observablehq.com/search?query=choropleth&onlyOwner=false
 *
 */

import * as d3 from 'd3';
import * as topojson from 'topojson';

// The county data to plot the choropleth with is in topojson format
// See here (https://github.com/topojson/topojson)
// For plotting in d3 we need to convert this to GeoJSON format
// This function does this conversion and then merges the spatial data
// with the corresponding county education data
const processData = (countyTopoData, educationData) => {
  const countyGeoData = topojson.feature(
    countyTopoData,
    countyTopoData.objects.counties,
  ).features;

  // Build object mapping ids to education data for mroe efficient processing:
  const countyIdToEdData = educationData.reduce((accum, edData) => {
    accum[edData.fips] = edData;
    return accum;
  }, {});

  console.log('Processed: ', countyIdToEdData[5089]);

  return countyGeoData.map((geoData) => {
    return { ...geoData, ...countyIdToEdData[geoData.id] };
  });
};

export default function choroplethBuilder(
  educationData,
  countyTopoData,
  parentSelector,
) {
  console.log('ChoroplethBuilder triggered!');
  console.log(educationData);
  console.log(countyTopoData);

  const mergedData = processData(countyTopoData, educationData);

  console.log('MERGED DATA: ', mergedData);

  const plotDiv = d3.select(parentSelector);

  plotDiv.html('');

  const width = 2000;
  const height = 0.6 * width;
  const padding = { left: 80, bottom: 140, top: 0, right: 40 };

  const graphSVG = plotDiv
    .append('svg')
    .attr('class', 'choropleth-svg')
    .attr('width', width)
    .attr('height', height);
  // .attr('viewBox', [0, 0, width, height]);

  graphSVG
    .append('rect')
    .attr('fill', 'white')
    .attr('width', width)
    .attr('height', height);

  // Apply projection sized to fit inside SVG area
  const path = d3.geoPath();

  console.log(
    topojson.feature(countyTopoData, countyTopoData.objects.counties),
  );

  console.log(educationData[0]);

  // Draw the map on a g element:
  // g element standard size with map is 999 x 583px
  graphSVG
    .append('g')
    .attr('class', 'map')
    .selectAll('path')
    .data(mergedData)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', (data) => data.fips)
    .attr('data-education', (data) => data.bachelorsOrHigher)
    .attr('d', path);

  // graphSVG.select('.map').attr('transform', ['scale(0.5)']);
}
