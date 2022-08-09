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
// with the corresponding county education data, sorted from
// lowest to highest education attainment
const processData = (usTopoData, educationData) => {
  const countyGeoData = topojson.feature(
    usTopoData,
    usTopoData.objects.counties,
  ).features;

  // Build object mapping ids to education data for more efficient processing:
  const countyIdToEdData = educationData.reduce((accum, edData) => {
    accum[edData.fips] = edData;
    return accum;
  }, {});

  const mergedData = countyGeoData.map((geoData) => {
    return { ...geoData, ...countyIdToEdData[geoData.id] };
  });

  // Sort the merged data from low to high educational attainment and add ranking
  mergedData.sort((a, b) => a.bachelorsOrHigher - b.bachelorsOrHigher);

  let lastValue = -Infinity;
  let lastRanking;
  return mergedData.map((dataObj, index) => {
    if (lastValue !== dataObj.bachelorsOrHigher) {
      lastValue = dataObj.bachelorsOrHigher;
      lastRanking = index + 1;
    }

    return {
      ...dataObj,
      nationalRank: lastRanking,
      numRanks: mergedData.length,
    };
  });
};

// Helper that updates tooltip when a county is moused over
const handleMouseOver = (event, countyData, colorScale, mergedData) => {
  const tooltip = d3.select('#tooltip');
  console.log('EVENT: ', event);

  console.log('EVENT: ', d3.select(event.target).attr('data-education'));

  tooltip
    .html('')
    .attr('data-education', countyData.bachelorsOrHigher)
    .style('top', `${event.layerY - 20}px`)
    .style('left', `${event.layerX + 40}px`)
    .style('background-color', `${colorScale(countyData.bachelorsOrHigher)}`)
    .style('visibility', 'visible');

  tooltip.append('h5').text(`${countyData['area_name']}, ${countyData.state}`);

  tooltip
    .append('h6')
    .text(`Educational Attainment: ${countyData.bachelorsOrHigher}`);

  // Add State and National Ranking:
  const stateData = mergedData.filter(
    (dataObj) => dataObj.state === countyData.state,
  );

  const countiesInState = stateData.length;
  const stateRank = stateData.reduce((accum, dataObj, index) => {
    if (dataObj['area_name'] === countyData['area_name']) {
      return index + 1;
    } else {
      return accum;
    }
  }, 0);

  tooltip
    .append('h6')
    .text(`State Ranking:    ${stateRank} / ${countiesInState}`);

  // !!! This ranking is not 100% accurate where counties have the same attainment
  tooltip
    .append('h6')
    .text(
      `National Ranking: ${countyData.nationalRank} / ${countyData.numRanks}`,
    );
};

// Hide tooltip on county mouseout
const handleMouseOut = () => {
  d3.select('#tooltip').style('visibility', 'hidden');
};

export default function choroplethBuilder(
  educationData,
  usTopoData,
  parentSelector,
) {
  console.log('ChoroplethBuilder triggered!');
  console.log(educationData);
  console.log(usTopoData);

  // Merge County Data with Education Data
  const mergedData = processData(usTopoData, educationData);

  // Find extent of education data for color scaling:
  let [edMin, edMax] = d3.extent(
    mergedData,
    (dataObj) => dataObj.bachelorsOrHigher,
  );

  console.log(edMin, edMax);

  // Round these numbers to the nearest 5:
  edMin = Math.floor(edMin / 5) * 5;
  edMax = Math.ceil(edMax / 5) * 5;

  console.log(edMin, edMax);

  // See color schemes here https://observablehq.com/@d3/color-schemes
  const colorScale = d3
    .scaleQuantile()
    .domain(mergedData.map((dataObj) => dataObj.bachelorsOrHigher))
    .range([
      '#f7fbff',
      '#e3eef9',
      '#cfe1f2',
      '#b5d4e9',
      '#93c3df',
      '#6daed5',
      '#4b97c9',
      '#2f7ebc',
      '#1864aa',
      '#0a4a90',
    ]);
  // .scaleQuantize()
  // .domain([edMin, edMax])
  // .range([
  //   '#f7fbff',
  //   '#e3eef9',
  //   '#cfe1f2',
  //   '#b5d4e9',
  //   '#93c3df',
  //   '#6daed5',
  //   '#4b97c9',
  //   '#2f7ebc',
  //   '#1864aa',
  //   '#0a4a90',
  // ]);

  console.log('MERGED DATA: ', mergedData[mergedData.length - 1]);

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

  // Add tooltip element
  plotDiv
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .attr('id', 'tooltip');

  // Apply projection sized to fit inside SVG area
  const path = d3.geoPath();

  console.log(topojson.feature(usTopoData, usTopoData.objects.counties));

  console.log(educationData[0]);

  // Draw the counties map on a g element:
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
    .attr('d', path)
    .style('fill', (dataObj) => colorScale(dataObj.bachelorsOrHigher))
    .on('mouseover', function (event, dataObj) {
      handleMouseOver(event, dataObj, colorScale, mergedData);
    })
    .on('mouseout', handleMouseOut);

  // Add a single path element that draws the borders between states
  // See https://github.com/topojson/topojson-client/blob/master/README.md#mesh
  const stateborders = topojson.mesh(
    usTopoData,
    usTopoData.objects.states,
    (a, b) => a !== b, // Filter function that removes non-internal borders
  );

  d3.select('.map')
    .append('path')
    .attr('class', 'states')
    .attr('d', path(stateborders))
    .style('stroke', '#282c34')
    .style('fill', 'none');

  // graphSVG.select('.map').attr('transform', ['scale(0.5)']);

  // Add tooltip element
  plotDiv
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .attr('id', 'tooltip');
}
