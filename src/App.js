import React, { useContext, useState, useEffect, useRef } from "react";
import "antd/dist/antd.css";
import "./App.css";
import { Table, Input, Button, Form } from "antd";
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;
  if (editable) {
    let required = true;
    if (dataIndex === "lat" || dataIndex === "lon") required = false;
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: required,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        dataIndex: "operationDelete",
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              <img src="/delete-32.png" alt="delete" onClick={() => this.handleDelete(record.key)}></img>
            </div>
          ) : null,
      },
      {
        title: "Идентификатор заказа",
        dataIndex: "number",
        editable: true,
        align: "center",
        width: "10%",
      },
      {
        title: "Широта (необязательно)",
        dataIndex: "lat",
        editable: true,
        align: "center",
        width: "7%",
      },
      {
        title: "Долгота (необязательно)",
        dataIndex: "lon",
        editable: true,
        align: "center",
        width: "7%",
      },
      {
        title: "Наименование получателя",
        dataIndex: "recName",
        editable: true,
        align: "center",
      },
      {
        title: "Адрес получателя",
        dataIndex: "recAdr",
        editable: true,
        align: "center",
      },
      {
        title: "Окно",
        dataIndex: "window",
        editable: true,
        align: "center",
      },
      {
        title: "Жесткое окно, Да/Нет",
        dataIndex: "harshWindow",
        editable: true,
        align: "center",
        width: "6%",
      },
      {
        title: "Время обслуживания на адрес, сек",
        dataIndex: "timeAdr",
        editable: true,
        align: "center",
        width: "7%",
      },
      {
        title: "Время обслуживания на заказ, сек",
        dataIndex: "timeDel",
        editable: true,
        align: "center",
        width: "7%",
      },
      {
        title: "Вес, кг",
        dataIndex: "weight",
        editable: true,
        align: "center",
      },
    ];
    this.state = {
      dataSource: [
        {
          key: "1",
          number: "Текстовый заказ 1",
          lat: "55.730847",
          lon: "37.576789",
          recName: "Перекресток",
          recAdr: "Усачева ул.,2, стр.1",
          window: "09:00-10:00",
          harshWindow: "true",
          timeAdr: "600",
          timeDel: "120",
          weight: "42.4",
        },
      ],
      count: 2,
    };
  }

  handleDelete = (key) => {
    const { count, dataSource } = this.state;
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
      count: count - 1,
    });
  };
  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      number: `Текстовый заказ ${count}`,
      lat: "",
      lon: "",
      recName: "Перекресток",
      recAdr: "Усачева ул.,2, стр.1",
      window: "09:00-10:00",
      harshWindow: "true",
      timeAdr: "600",
      timeDel: "120",
      weight: "42.4",
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  };
  handleSave = (row) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    this.setState({
      dataSource: newData,
    });
  };

  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div>
        <Button
          onClick={this.handleAdd}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          Добавить строку
        </Button>
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
          columns={columns}
        />
      </div>
    );
  }
}

export default App;
