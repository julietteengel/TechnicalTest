import React, { useState, useEffect } from "react";
import { readString } from 'react-papaparse';
import bandsListCSV from '../assets/metal_bands_2017.csv';
import Table from 'react-bootstrap/Table';
import Filters from './Filters';
import _ from 'lodash';

export default function BandsList() {
  // to store the parse data
  const [data, setData] = useState([]);
  const [initialData, setInitialData] = useState([]);
  const headers = ["Band name", "Fans", "Formed", "Origin", "Split", "Style"]
  const [countries, setCountries] = useState([]);
  const [styles, setStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");

  const loadData = () => {
    readString(bandsListCSV, {
      complete: (results, file) => {
        console.log('Parsing complete:', results, file);
        // sort data by name alphabetically
        setData(_.sortBy(results.data, o => o.band_name));
        setInitialData(_.sortBy(results.data, o => o.band_name));
      },
      download: true,
      header: true,
      error: (error, file) => {
        console.log('Error while parsing:', error, file)
      }
    })
  };

  useEffect(() => {
    loadData(data);
  }, []); //empty array as second argument.

  useEffect(() => {
    setCountries([...new Set(data.map(function (el) { return el.origin }))]);
    setStyles([...new Set(data.map(function (el) { return el.style }))]);
  }, [initialData]);


  // FILTERS
  // note: filters are not interdependent:
  // - click on all will display all records, even if the other filter is set
  // - only the last filter is taken into account, can't combine two filters (lack of time to implement)

  const handleSelectStyle = (event) => {
    setSelectedStyle(event.target.value);

    const filtered_data = initialData.filter((band) => {
      if (selectedCountry === "all") {
        return band;
      } else {
        return band.origin === selectedCountry;
      } }).filter((band) => {
        if (event.target.value === "all") {
          return band;
        } else {
          return band.style === event.target.value;
        }
      })

    setData(filtered_data);
  };


  const handleSelectCountry = (event) => {
    setSelectedCountry(event.target.value);

    const filtered_data = initialData.filter((band) => {
      if (event.target.value === "all") {
        return band;
      } else {
        return band.origin === event.target.value;
      } }).filter((band) => {
        if (selectedStyle === "all") {
          return band;
        } else {
          return band.style === selectedStyle;
        }
      })

    setData(filtered_data);
  };

  // SORT
  const sortByYearAsc = () => {
    // setData(data.sort((a, b) => (parseInt(a.formed) - parseInt(b.formed))))
    setData(_.orderBy(data, 'formed', 'asc'));
  };

  const sortByYearDesc = () => {
    // setData(data.sort((a, b) => (parseInt(b.formed) - parseInt(a.formed))))
    setData(_.orderBy(data, 'formed', 'desc'));
  };

  return (
    <div className="bands">
      {
        (styles.length && countries.length) && (
          <Filters
            handleSelectStyle={handleSelectStyle}
            handleSelectCountry={handleSelectCountry}
            selectedStyle={selectedStyle}
            selectedCountry={selectedCountry}
            styles={styles}
            countries={countries}
            sortByYearAsc={sortByYearAsc}
            sortByYearDesc={sortByYearDesc}
          />
        )
      }

      <Table striped bordered hover>
        <thead>
          <tr>
            {headers.map((header) => (
              <th>{header}</th>
            )
            )}
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((row, index) => (
              <tr key={index}>
                <td>{row.band_name}</td>
                <td>{row.fans}</td>
                <td>{row.formed}</td>
                <td>{row.origin}</td>
                <td>{row.split}</td>
                <td>{row.style}</td>
              </tr>
            )
            )}
        </tbody>
      </Table>
    </div>
  );
}