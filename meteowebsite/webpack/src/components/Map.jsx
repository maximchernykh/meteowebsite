import React, { useState, useEffect } from "react";

import axios from "axios";
import { FormattedMessage, FormattedDate, FormattedTime } from "react-intl";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
L.Marker.prototype.options.icon = L.icon({
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import { Divider, Select, Space } from "antd";
const { Option } = Select;
import CustomAntdTable from "./CustomAntdTable";
const columns = [
  {
    title: <FormattedMessage id="table.type_name" />,
    dataIndex: "type_name",
    width: 110,
    sorter: (a, b) => a.type_name.localeCompare(b.type_name),
  },
  {
    title: <FormattedMessage id="table.type_unit" />,
    dataIndex: "type_unit",
    width: 100,
    sorter: (a, b) => a.type_unit.localeCompare(b.type_unit),
  },
  {
    title: <FormattedMessage id="table.normal.date" />,
    dataIndex: "date",
    width: "100%",
    sorter: (a, b) => a.date - b.date,
    render: (timestamp, record, index) => {
      let date = new Date(timestamp);
      return (
        <div>
          <FormattedDate value={date} /> <FormattedTime value={date} />
        </div>
      );
    },
  },
  {
    title: <FormattedMessage id="table.normal.value" />,
    dataIndex: "value",
    sorter: (a, b) => a.value - b.value,
    render: (value, record, index) => {
      return value.toFixed(6).replace(/\.?0+$/, "");
    },
  },
];

function MarkerPopup(props) {
  const [pointTableIndex, setPointTableIndex] = useState(0);
  const handleStationChange = (index) => {
    setPointTableIndex(index);
  };

  return (
    <Marker position={props.position}>
      <Popup maxWidth={3000}>
        <div style={{ display: "flex" }}>
          <h3
            style={{
              margin: "auto 0 auto 0",
            }}
          >
            {props.pointName}
          </h3>
          <Space style={{ margin: "auto 0 auto auto" }}>
            <FormattedMessage id="map.popup.station" />
            <Select
              style={{ width: "120px" }}
              defaultValue={pointTableIndex}
              onChange={handleStationChange}
            >
              {props.stationOptions}
            </Select>
          </Space>
        </div>
        <Divider />
        <CustomAntdTable
          columns={columns}
          dataSource={props.stationDatas[pointTableIndex]}
        />
      </Popup>
    </Marker>
  );
}

export default function Map() {
  const [pointPopups, setPointPopups] = useState([]);

  useEffect(() => {
    axios
      .get("/api/points", {
        params: { mode: "latest" },
      })
      .then((response) => {
        let pointPopups = [];

        let i = 0;
        for (const point of response.data) {
          let position = [point.latitude, point.longitude];

          let station_select_options = [];
          let a = 0;
          for (const station of point.station_set) {
            station_select_options.push(
              <Option key={a} value={a}>
                {station.name}
              </Option>
            );
            a++;
          }

          let station_datas = [];
          for (const station of point.station_set) {
            let data_set = [];
            let a = 0;
            for (const data of station.data_set) {
              data_set.push({
                key: a,
                type_name: data.type.name,
                type_unit: data.type.unit,
                value: data.value,
                date: data.date,
              });
              a++;
            }
            station_datas.push(data_set);
          }

          pointPopups.push(
            <MarkerPopup
              key={i}
              position={position}
              pointName={point.name}
              stationOptions={station_select_options}
              stationDatas={station_datas}
            />
          );
          i++;
        }

        setPointPopups(pointPopups);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <MapContainer
      style={{ zIndex: 0, width: "100%", height: "100%" }}
      attributionControl={false}
      center={[50, 69]}
      zoom={6}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pointPopups}
    </MapContainer>
  );
}
