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

// Background color of app to be used in chart color scheme:
const BACKGROUND_COLOR = '#282c34';

// Array of colors for the chart color scale:
// See color schemes here https://observablehq.com/@d3/color-schemes
const COLOR_ARR = [
  '#e3eef9',
  '#cfe1f2',
  '#b5d4e9',
  '#93c3df',
  '#6daed5',
  '#4b97c9',
  '#2f7ebc',
  '#1864aa',
  '#0a4a90',
  '#08306b',
];

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
  mergedData.sort((a, b) => b.bachelorsOrHigher - a.bachelorsOrHigher);

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
  const tooltipBackgroundColor = colorScale(countyData.bachelorsOrHigher);
  const screenWidth = d3.select('body').node().getBoundingClientRect().width;

  // Display tooltip at cursor position, add county data and dynamic color
  tooltip
    .html('')
    .attr('data-education', countyData.bachelorsOrHigher)
    .style('top', `${event.pageY - 20}px`)
    .style(
      'left',
      event.clientX > screenWidth / 2
        ? `${event.pageX - 200}px`
        : `${event.pageX + 40}px`,
    )
    .style(
      'color',
      COLOR_ARR.indexOf(tooltipBackgroundColor) > 4
        ? 'white'
        : `${BACKGROUND_COLOR}`,
    )
    .style('background-color', `${tooltipBackgroundColor}`)
    .style('visibility', 'visible')
    .style('display', 'block');

  tooltip.append('h5').text(`${countyData['area_name']}, ${countyData.state}`);

  tooltip
    .append('h6')
    .text(`Educational Attainment: ${countyData.bachelorsOrHigher}%`);

  // Add State and National Ranking info to tooltip:
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

// Main function to build choropleth plot
export default function choroplethBuilder(
  educationData,
  usTopoData,
  parentSelector,
  containerWidth,
) {
  // Merge County Data with Education Data
  const mergedData = processData(usTopoData, educationData);

  // Find extent of education data for color scaling:
  let [edMin, edMax] = d3.extent(
    mergedData,
    (dataObj) => dataObj.bachelorsOrHigher,
  );

  // Round these numbers to the nearest 5:
  edMin = Math.floor(edMin / 5) * 5;
  edMax = Math.ceil(edMax / 5) * 5;

  const colorScale = d3.scaleQuantize().domain([edMin, edMax]).range(COLOR_ARR);

  const plotDiv = d3.select(parentSelector);

  plotDiv.html('');

  const width = Math.max(containerWidth, 720);
  const height = Math.min(0.65 * width, 700);
  const padding = { left: 40, bottom: 20, top: 40, right: 80 };

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

  // Draw the counties map on a g element:
  // g element standard size with map is 999 x 583px
  const path = d3.geoPath();

  graphSVG
    .append('g')
    .attr('class', 'map')
    .selectAll('path')
    .data(mergedData)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', (countyData) => countyData.fips)
    .attr('data-education', (countyData) => countyData.bachelorsOrHigher)
    .attr('data-color-index', (countyData) =>
      COLOR_ARR.indexOf(colorScale(countyData.bachelorsOrHigher)),
    )
    .attr('d', path)
    .style('fill', (countyData) => colorScale(countyData.bachelorsOrHigher))
    .on('mouseover', function (event, countyData) {
      handleMouseOver(event, countyData, colorScale, mergedData);
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
    .style('stroke', BACKGROUND_COLOR)
    .style('fill', 'none');

  // Adjust position and scale of Choropleth based on available width/height of parent
  const availableWidth = width - padding.left;
  const widthScale = availableWidth / 980;

  const availableHeight = height - padding.top - padding.bottom;
  const heightScale = availableHeight / 583;

  const scaleFactor = widthScale < heightScale ? widthScale : heightScale;

  graphSVG
    .select('.map')
    .attr('transform', [
      `translate(${padding.left}, ${padding.top})`,
      `scale(${scaleFactor})`,
    ]);

  // Add tooltip element
  plotDiv
    .append('div')
    .style('position', 'absolute')
    .style('display', 'none')
    .style('visibility', 'hidden')
    .attr('id', 'tooltip');

  // Create color legend for z-axis
  const legendWidth = 400;
  const legendHeight = 20;
  const legendTop = padding.top / 2;

  const zLegendScale = d3
    .scaleLinear()
    .domain([edMin, edMax])
    .range([width - padding.right - legendWidth, width - padding.right])
    .nice();

  const zLegendAxis = d3
    .axisBottom(zLegendScale)
    .tickValues(
      Array(11)
        .fill()
        .map((el, index) => edMin + (index / 10) * (edMax - edMin)),
    )
    .tickFormat((value) => `${value}%`);

  const zLegend = graphSVG.append('g').attr('id', 'legend');

  zLegend
    .selectAll('rect')
    .data(
      Array(10)
        .fill()
        .map((el, index) => edMin + (index / 10) * (edMax - edMin)),
    )
    .enter()
    .append('rect')
    .attr('x', (d) => zLegendScale(d))
    .attr('y', legendTop)
    .attr('width', (zLegendScale(edMax) - zLegendScale(edMin)) / 10)
    .attr('height', legendHeight)
    .attr('fill', (d) => colorScale(d));

  zLegend
    .append('g')
    .style('font-size', '14px')
    .attr('transform', `translate(0, ${legendTop + legendHeight})`)
    .call(zLegendAxis);
}
