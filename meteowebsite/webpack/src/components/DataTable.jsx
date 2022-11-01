import React, { useState, useEffect } from "react";

import axios from "axios";
const qs = require("qs");

import CustomAntdTable from "./CustomAntdTable";
import { Cascader } from "antd";
import { Layout } from "antd";
const { Content, Sider } = Layout;
import { Select } from "antd";
const { Option } = Select;
import {
  Button,
  Form,
  DatePicker,
  Card,
  Space,
  Switch,
  InputNumber,
} from "antd";

import { Resizable } from "re-resizable";

import { FormattedMessage, FormattedDate, FormattedTime } from "react-intl";

import { CloseOutlined, SyncOutlined } from "@ant-design/icons";

import useIsMobile from "./IsMobileHook";

const tableDateColumn = {
  width: 170,
  render: (timestamp, record, index) => {
    let date = new Date(timestamp);
    return (
      <div>
        <FormattedDate value={date} />{" "}
        <FormattedTime
          value={date}
          hour="numeric"
          minute="numeric"
          second="numeric"
        />
      </div>
    );
  },
};

const defaultColumns = [
  {
    title: <FormattedMessage id="table.point_name" />,
    dataIndex: "point_name",
    width: 180,
    sorter: (a, b) => a.point_name.localeCompare(b.point_name),
  },
  {
    title: <FormattedMessage id="table.station_name" />,
    dataIndex: "station_name",
    width: 180,
    sorter: (a, b) => a.station_name.localeCompare(b.station_name),
  },
  {
    title: <FormattedMessage id="table.type_name" />,
    dataIndex: "type_name",
    width: 120,
    sorter: (a, b) => a.type_name.localeCompare(b.type_name),
  },
  {
    title: <FormattedMessage id="table.type_unit" />,
    dataIndex: "type_unit",
    width: 100,
    sorter: (a, b) => a.type_unit.localeCompare(b.type_unit),
  },
];

const normalColumns = [
  ...defaultColumns,
  {
    ...tableDateColumn,
    title: <FormattedMessage id="table.normal.date" />,
    dataIndex: "date",
    sorter: (a, b) => a.date - b.date,
  },
  {
    title: <FormattedMessage id="table.normal.value" />,
    dataIndex: "value",
    width: 120,
    sorter: (a, b) => a.value - b.value,
    render: (value, record, index) => {
      return value.toFixed(6).replace(/\.?0+$/, "");
    },
  },
];

const averagingColumns = [
  ...defaultColumns,
  {
    ...tableDateColumn,
    title: <FormattedMessage id="table.averaging.start_date" />,
    dataIndex: "start_date",
    sorter: (a, b) => a.start_date - b.start_date,
  },
  {
    ...tableDateColumn,
    title: <FormattedMessage id="table.averaging.end_date" />,
    dataIndex: "end_date",
    sorter: (a, b) => a.end_date - b.end_date,
  },
  {
    title: <FormattedMessage id="table.averaging.avg" />,
    dataIndex: "avg",
    width: 120,
    sorter: (a, b) => a.avg - b.avg,
    render: (value, record, index) => {
      return value.toFixed(6).replace(/\.?0+$/, "");
    },
  },
  {
    title: <FormattedMessage id="table.averaging.min" />,
    dataIndex: "min",
    width: 120,
    sorter: (a, b) => a.min - b.min,
    render: (value, record, index) => {
      return value.toFixed(6).replace(/\.?0+$/, "");
    },
  },
  {
    title: <FormattedMessage id="table.averaging.max" />,
    dataIndex: "max",
    width: 120,
    sorter: (a, b) => a.max - b.max,
    render: (value, record, index) => {
      return value.toFixed(6).replace(/\.?0+$/, "");
    },
  },
  {
    title: <FormattedMessage id="table.averaging.deviation" />,
    dataIndex: "deviation",
    width: 120,
    sorter: (a, b) => a.deviation - b.deviation,
    render: (value, record, index) => {
      return value.toFixed(6).replace(/\.?0+$/, "");
    },
  },
];

export default function DataTable() {
  const [tableColumns, setTableColumns] = useState(normalColumns);
  const [tableDataSource, setTableDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const fetchTableData = (params = {}) => {
    setTableLoading(true);
    axios
      .get("/api/points", {
        params: params,
        paramsSerializer: (params) => {
          return qs.stringify(params, { arrayFormat: "comma" });
        },
      })
      .then((response) => {
        if (params.averaging_unit) {
          setTableColumns(averagingColumns);
        } else {
          setTableColumns(normalColumns);
        }

        let dataSource = [];
        let key = 0;
        for (const point of response.data) {
          let point_name = point.name;
          for (const station of point.station_set) {
            let station_name = station.name;
            for (const data of station.data_set) {
              let row = {
                key: key,
                point_name: point_name,
                station_name: station_name,
                type_name: data.type.name,
                type_unit: data.type.unit,
              };

              if (params.averaging_unit) {
                row = {
                  ...row,
                  start_date: data.start_date,
                  end_date: data.end_date,
                  avg: data.avg,
                  min: data.min,
                  max: data.max,
                  deviation: data.deviation,
                };
              } else {
                row = {
                  ...row,
                  date: data.date,
                  value: data.value,
                };
              }

              dataSource.push(row);
              key++;
            }
          }
        }
        setTableDataSource(dataSource);
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => {
        setTableLoading(false);
      });
  };

  const [stationOptions, setStationOptions] = useState([]);
  const fetchStationData = () => {
    axios
      .get("/api/stations")
      .then((response) => {
        let stationOptions = [];
        let i = 0;
        for (const point of response.data) {
          let p = {
            value: i,
            label: point.name,
            children: [],
          };
          for (const station of point.station_set) {
            p.children.push({ value: station.id, label: station.name });
          }
          stationOptions.push(p);
          i++;
        }
        setStationOptions(stationOptions);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const [dataTypeOptions, setDataTypeOptions] = useState([]);
  const fetchDataTypeData = () => {
    axios
      .get("/api/datatypes")
      .then((response) => {
        let dataTypeOptions = [];
        for (const dataType of response.data) {
          dataTypeOptions.push(
            <Option key={dataType.id}>{dataType.name}</Option>
          );
        }
        setDataTypeOptions(dataTypeOptions);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const [dateStartValue, setDateStartValue] = useState();
  const [dateEndValue, setDateEndValue] = useState();
  const disabledStartDate = (startValue) => {
    if (!startValue || !dateEndValue) {
      return false;
    }
    return startValue.valueOf() > dateEndValue;
  };
  const disabledEndDate = (endValue) => {
    if (!endValue || !dateStartValue) {
      return false;
    }
    return endValue.valueOf() <= dateStartValue;
  };
  const onStartChange = (value) => {
    setDateStartValue(value);
  };
  const onEndChange = (value) => {
    setDateEndValue(value);
  };

  const [averagingEnabled, setAveragingEnabled] = useState(false);
  const onAveragingToggle = (checked) => {
    setAveragingEnabled(checked);
  };

  const formOnFinish = (values) => {
    if (values.stations) {
      let stations = [];
      for (let point of values.stations) {
        if (point.length == 1) {
          for (let station of stationOptions[point[0]].children) {
            stations.push(station.value);
          }
        } else {
          for (let station of point.slice(1)) {
            stations.push(station);
          }
        }
      }
      values.stations = stations;
    }

    if (values.start_date && values.start_date._d != "") {
      values.start_date = values.start_date._d;
    } else {
      delete values.start_date;
    }
    if (values.end_date && values.end_date._d != "") {
      values.end_date = values.end_date._d;
    } else {
      delete values.end_date;
    }

    if (!values.past_period_num) {
      delete values.past_period_num;
    }

    if (!averagingEnabled) {
      delete values.averaging_num;
      delete values.averaging_unit;
    } else if (!values.averaging_num) {
      delete values.averaging_num;
    }

    fetchTableData(values);
  };

  useEffect(() => {
    fetchStationData();
    fetchDataTypeData();
  }, []);

  const isMobile = useIsMobile();
  const [siderCollapsed, setSiderCollapsed] = useState(true);

  const AbsoluteDateForm = [
    <Form.Item
      key="start_date"
      style={{ margin: "0", marginBottom: "6px" }}
      label={<FormattedMessage id="table.form.absolute.start_date" />}
      name="start_date"
    >
      <DatePicker
        disabledDate={disabledStartDate}
        showTime={{ format: "HH:mm" }}
        format="YYYY-MM-DD HH:mm"
        value={dateStartValue}
        onChange={onStartChange}
        style={{ width: "100%" }}
      />
    </Form.Item>,
    <Form.Item
      key="end_date"
      style={{ margin: "0" }}
      label={<FormattedMessage id="table.form.absolute.end_date" />}
      name="end_date"
    >
      <DatePicker
        disabledDate={disabledEndDate}
        showTime={{ format: "HH:mm" }}
        format="YYYY-MM-DD HH:mm"
        value={dateEndValue}
        onChange={onEndChange}
        style={{ width: "100%" }}
      />
    </Form.Item>,
  ];
  const RelativeDateForm = [
    <Form.Item
      key="relative_date"
      style={{ margin: "0" }}
      label={<FormattedMessage id="table.form.relative.last" />}
    >
      <Form.Item noStyle name="past_period_num" initialValue={1}>
        <InputNumber style={{ width: "50%" }} min={0} />
      </Form.Item>
      <Form.Item noStyle name="past_period_unit" initialValue="days">
        <Select style={{ width: "50%" }}>
          <Option value="seconds">
            <FormattedMessage id="table.form.averaging.seconds" />
          </Option>
          <Option value="minutes">
            <FormattedMessage id="table.form.averaging.minutes" />
          </Option>
          <Option value="hours">
            <FormattedMessage id="table.form.averaging.hours" />
          </Option>
          <Option value="days">
            <FormattedMessage id="table.form.averaging.days" />
          </Option>
          <Option value="weeks">
            <FormattedMessage id="table.form.averaging.weeks" />
          </Option>
          <Option value="months">
            <FormattedMessage id="table.form.averaging.months" />
          </Option>
          <Option value="quarters">
            <FormattedMessage id="table.form.averaging.quarters" />
          </Option>
          <Option value="years">
            <FormattedMessage id="table.form.averaging.years" />
          </Option>
        </Select>
      </Form.Item>
    </Form.Item>,
  ];
  const [dateForm, setDateForm] = useState(AbsoluteDateForm);
  const onRelativeDateToggle = (checked) => {
    if (checked) {
      setDateForm(RelativeDateForm);
    } else {
      setDateForm(AbsoluteDateForm);
    }
  };

  const TableSider = (
    <Sider
      collapsed={isMobile ? siderCollapsed : false}
      collapsible={isMobile}
      reverseArrow
      collapsedWidth={0}
      defaultCollapsed={isMobile}
      theme="light"
      width="100%"
      style={{
        overflow: isMobile && siderCollapsed ? "visible" : "auto",
        float: "right",
        height: "100%",
        padding: "3px",
      }}
      onCollapse={() => setSiderCollapsed(!siderCollapsed)}
    >
      {isMobile ? (
        <Button
          icon={<CloseOutlined />}
          onClick={() => setSiderCollapsed(true)}
          style={{ float: "right", marginBottom: "10px" }}
        />
      ) : null}
      <Form layout="vertical" onFinish={formOnFinish}>
        <Space
          direction="vertical"
          size="small"
          style={{ width: "100%", display: "flex" }}
        >
          <Card
            size="small"
            type="inner"
            title={<FormattedMessage id="table.form.stations" />}
          >
            <Form.Item style={{ margin: "0" }} name="stations">
              <Cascader
                options={stationOptions}
                multiple
                expandTrigger="hover"
                maxTagCount="responsive"
                placeholder={
                  <FormattedMessage id="table.form.stations_placeholder" />
                }
              />
            </Form.Item>
          </Card>

          <Card
            size="small"
            type="inner"
            title={<FormattedMessage id="table.form.datatypes" />}
          >
            <Form.Item style={{ margin: "0" }} name="datatypes">
              <Select
                mode="multiple"
                allowClear
                placeholder={
                  <FormattedMessage id="table.form.datatypes_placeholder" />
                }
              >
                {dataTypeOptions}
              </Select>
            </Form.Item>
          </Card>

          <Card
            size="small"
            type="inner"
            title={
              <Space>
                <Switch onChange={onRelativeDateToggle} />
                <FormattedMessage id="table.form.relative_date.switch" />
              </Space>
            }
          >
            {dateForm}
          </Card>

          <Card
            size="small"
            type="inner"
            title={
              <Space>
                <Switch onChange={onAveragingToggle} />
                <FormattedMessage id="table.form.averaging.switch" />
              </Space>
            }
          >
            <Form.Item noStyle name="averaging_num" initialValue={1}>
              <InputNumber
                disabled={!averagingEnabled}
                style={{ width: "50%" }}
                min={0}
              />
            </Form.Item>
            <Form.Item noStyle name="averaging_unit" initialValue="days">
              <Select disabled={!averagingEnabled} style={{ width: "50%" }}>
                <Option value="seconds">
                  <FormattedMessage id="table.form.averaging.seconds" />
                </Option>
                <Option value="minutes">
                  <FormattedMessage id="table.form.averaging.minutes" />
                </Option>
                <Option value="hours">
                  <FormattedMessage id="table.form.averaging.hours" />
                </Option>
                <Option value="days">
                  <FormattedMessage id="table.form.averaging.days" />
                </Option>
                <Option value="weeks">
                  <FormattedMessage id="table.form.averaging.weeks" />
                </Option>
                <Option value="months">
                  <FormattedMessage id="table.form.averaging.months" />
                </Option>
                <Option value="quarters">
                  <FormattedMessage id="table.form.averaging.quarters" />
                </Option>
                <Option value="years">
                  <FormattedMessage id="table.form.averaging.years" />
                </Option>
              </Select>
            </Form.Item>
          </Card>

          <Form.Item>
            <Button
              type="primary"
              key="submit"
              htmlType="submit"
              icon={<SyncOutlined />}
              style={{
                display: "block",
                margin: "auto",
              }}
            >
              <span>
                <FormattedMessage id="table.form.update" />
              </span>
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </Sider>
  );

  return (
    <Layout>
      <Content>
        <CustomAntdTable
          columns={tableColumns}
          dataSource={tableDataSource}
          loading={tableLoading}
          resizable
          sticky
          scroll={{ scrollToFirstRowOnChange: true, y: "100vh" }}
        />
      </Content>
      {isMobile ? (
        TableSider
      ) : (
        <Resizable
          enable={{ left: true }}
          bounds="parent"
          boundsByDirection={true}
          defaultSize={{ width: "270px", height: "auto" }}
          minWidth="235px"
          maxWidth="50%"
        >
          {TableSider}
        </Resizable>
      )}
    </Layout>
  );
}
