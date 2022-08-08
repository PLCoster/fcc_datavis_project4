import * as d3 from 'd3';

export default function choroplethBuilder(
  educationData,
  countyTopoData,
  parentSelector,
) {
  console.log('ChoroplethBuilder triggered!');
  console.log(educationData);
  console.log(countyTopoData);

  const plotDiv = d3.select(parentSelector);

  plotDiv.html('');

  const width = 1000;
  const height = 0.6 * width;
  const padding = { left: 80, bottom: 140, top: 0, right: 40 };

  const graphSVG = plotDiv
    .append('svg')
    .attr('class', 'graph')
    .attr('width', width)
    .attr('height', height);

  graphSVG
    .append('rect')
    .attr('fill', 'white')
    .attr('width', 500)
    .attr('height', 500);
}
