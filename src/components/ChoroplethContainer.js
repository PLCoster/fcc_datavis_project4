import { useState, useEffect, useRef } from 'react';

import Choropleth from './Choropleth';

import './Choropleth.css';

import edDataBackup from './assets/educationData.json';
import countyDataBackup from './assets/countyTopoData.json';

const dataURLS = [
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json',
];

export default function ChoroplethContainer() {
  const [dataLoaded, setDataLoaded] = useState(false);

  const [educationData, setEducationData] = useState(null);
  const [countyTopoData, setCountiesTopoData] = useState(null);

  const [containerWidth, setContainerWidth] = useState(1000);
  const [containerOpacity, setContainerOpacity] = useState(0);

  const containerRef = useRef(null);

  // Load data on mounting:
  useEffect(() => {
    // Get education and counties data from given URLs
    Promise.all(dataURLS.map((url) => fetch(url)))
      .then((responseArr) => {
        if (responseArr[0].status === 200 && responseArr[1].status === 200) {
          return Promise.all(responseArr.map((response) => response.json()));
        } else {
          throw new Error('Response status not 200');
        }
      })
      .then(([edData, countData]) => {
        setEducationData(edData);
        setCountiesTopoData(countData);
        setDataLoaded(true);
      })
      .catch((err) => {
        // If an error occurs on fetch, resort to backup copies
        console.log('Error when fetching plot data: ', err);
        setEducationData(edDataBackup);
        setCountiesTopoData(countyDataBackup);
        setDataLoaded(true);
      });
  }, []);

  // Set up event listener to update plot width on window resize
  useEffect(() => {
    const handleWindowResize = () => {
      setContainerWidth(containerRef.current.clientWidth);
    };
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return (
    <>
      <main
        className="container-md"
        ref={containerRef}
        style={{ opacity: containerOpacity }}
      >
        {dataLoaded ? (
          <Choropleth
            educationData={educationData}
            countyTopoData={countyTopoData}
            containerWidth={containerWidth}
            setContainerOpacity={setContainerOpacity}
          />
        ) : (
          'Loading plot data...'
        )}
      </main>
    </>
  );
}
