import { useEffect } from 'react';

import choroplethBuilder from './helpers/choroplethBuilder';

const choroContainerId = 'choropleth-container';

export default function Choropleth({ educationData, countyTopoData }) {
  // On mount, run d3 script to build graph:
  useEffect(() => {
    choroplethBuilder(educationData, countyTopoData, `#${choroContainerId}`);
  }, []);
  return (
    <>
      <h1>This is the choropleth</h1>
      <div id={choroContainerId} />
    </>
  );
}
