import { useEffect } from 'react';

import choroplethBuilder from './helpers/choroplethBuilder';

const choroContainerId = 'choropleth-container';

export default function Choropleth({
  educationData,
  countyTopoData,
  containerWidth,
  setContainerOpacity,
}) {
  // On mount, run d3 script to build graph, then make container visible:
  useEffect(() => {
    choroplethBuilder(
      educationData,
      countyTopoData,
      `#${choroContainerId}`,
      containerWidth,
    );

    setContainerOpacity(100);
  }, [educationData, countyTopoData, containerWidth, setContainerOpacity]);

  return (
    <>
      <h1 id="title" className="display-6">
        United States Educational Attainment Choropleth
      </h1>
      <h3 id="description" className="display-6">
        Percentage of adults age 25 and older with a bachelor's degree or higher
        (2010-2014)
      </h3>
      <div id={choroContainerId} />
    </>
  );
}
