import { useState, useEffect } from 'react';

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

  // Load data on mounting:
  useEffect(() => {
    // Get education and counties data from given URLs
    Promise.all(dataURLS.map((url) => fetch(url)))
      .then((responseArr) => {
        console.log(responseArr);
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

  return (
    <>
      <main className="container-md">
        {dataLoaded ? (
          <Choropleth
            educationData={educationData}
            countyTopoData={countyTopoData}
          />
        ) : (
          'Loading plot data...'
        )}
      </main>
    </>
  );
}
