import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { Resizable } from "react-resizable";

const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  const [minWidth, setMinWidth] = useState();
  const [maxWidth, setMaxWidth] = useState(450);
  useEffect(() => {
    setMinWidth(width < 95 ? width : 95);
  }, []);

  return (
    <Resizable
      width={width}
      height={0}
      minConstraints={[minWidth, 0]}
      maxConstraints={[maxWidth, 0]}
      handle={
        <div
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

export default function CustomAntdTable(props) {
  const { columns, resizable, ...restProps } = props;

  const [_columns, _setColumns] = useState(columns);
  useEffect(() => {
    _setColumns(columns);
  }, [columns]);

  const handleResize =
    (index) =>
    (e, { size }) => {
      const nextColumns = [..._columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      _setColumns(nextColumns);
    };
  const resizableColumns = _columns.map((col, index) => ({
    ...col,
    onHeaderCell: (column) => ({
      width: column.width,
      onResize: handleResize(index),
    }),
  }));

  return (
    <Table
      components={resizable ? { header: { cell: ResizableTitle } } : {}}
      rowClassName={(record, index) =>
        index % 2 === 0 ? "table-row-light" : "table-row-dark"
      }
      size="small"
      pagination={false}
      bordered
      columns={resizable ? resizableColumns : columns}
      {...restProps}
    />
  );
}
