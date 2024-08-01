import React, { useEffect, useState } from "react";
import { Breadcrumbs } from "../../AbstractElements";
import { useForm } from "react-hook-form";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Label,
  Row,
  Button,
} from "reactstrap";
import { aasraListAPI } from "../../api/dropdowns";
import Select from "react-select/creatable";
import DatePicker from "react-datepicker";
import MyDataTable from "../../Components/MyComponents/MyDataTable";
import { paymentReportAasraAPI, paymentReportListAPI } from "../../api/revenue";
import { toast } from "react-toastify";

const PaymentReports = () => {
  const userToken = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("userDetail"));
  const tokenHeader = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      Authorization: "Bearer " + `${userToken}`,
    },
  };
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm();
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const [tableColumn, setTablecolumn] = useState([
    {
      name: "Sr.no.",
      selector:(row)=>row.serial_no,
      sortable: false,
      width: "100px",
      // cell: (row, index) => index + 1  //RDT provides index by default
    },
    {
      name: "Order Date",
      selector: (row) => row.order_date,
      sortable: true,
    },
    {
      name: "Order Status",
      selector: (row) => row.order_status,
      sortable: true,
    },
    {
      name: "Order Amount",
      selector: (row) => row.order_amount,
      sortable: true,
      width: "200px",
    },
    {
      name: "Paid Amount",
      selector: (row) => row.paid_amount,
      sortable: true,
      width: "200px",
    },
    {
      name: "Balance (if any)",
      selector: (row) => row.balance,
      sortable: true,
      width: "200px",
    },
    {
      name: "Payment Date",
      selector: (row) => row.payment_date,
      sortable: true,
      width: "200px",
    },
    {
      name: "Payment Method",
      selector: (row) => row.payment_method,
      sortable: true,
      width: "200px",
    },
    {
      name: "Payment Status",
      selector: (row) => row.payment_status,
      sortable: true,
      width: "200px",
    },
    {
      name: "Transaction ID",
      selector: (row) => row.transaction_id,
      sortable: true,
      width: "200px",
    },
    {
      name: "DPS Number",
      selector: (row) => row.dps_no,
      sortable: true,
      width: "200px",
    },
    { name: "DPS Date", selector: (row) => row.dps_date, sortable: true },
    { name: "DPS Value", selector: (row) => row.dps_value, sortable: true },
  ]);
  const [aasraList, setAasraList] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const handleAsraList = (data) => {
    setValue("aasra_name", data);
    trigger("aasra_name");
  };

  useEffect(() => {
    aasralist();
  }, []);

  const aasralist = () => {
    aasraListAPI({}, tokenHeader)
      .then((res) => {
        if (res.data.status === "success") {
          console.log("res.data", res.data.data);
          setAasraList(res.data.data);
        } else {
          console.log("Error fetching Aasra list:", res.data);
        }
      })
      .catch((err) => {
        console.log("Error in API call:", err);
      });
  };

  const onFormSubmit = (formData) => {
    setIsLoading(true);
  
    const searchData = {
      startDate: startDate,
      endDate: endDate,
    };
  
    const token = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        Authorization: "Bearer " + `${userToken}`,
      },
    };
  
    const handleApiResponse = (res) => {
      if (res.data.status === "success") {
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          setData(res.data.data);
          toast.success(res.data.message);
        } else {
          setData([]);
          toast.error("No records found");
        }
      } else {
        setData([]);
        toast.error(res.data.message);
      }
    };
  
    const handleApiError = (errors) => {
      setData([]);
      console.error("Error fetching payment reports:", errors);
      toast.error("Error fetching payment reports");
    };
  
    if (user?.user_type === "S") {
      searchData.aasra_id = formData.aasra_name?.value;
      paymentReportListAPI(searchData, token)
        .then(handleApiResponse)
        .catch(handleApiError)
        .finally(() => {
          setIsLoading(false);
        });
    } else if (user?.user_type === "AC") {
      paymentReportListAPI(searchData, token)
        .then(handleApiResponse)
        .catch(handleApiError)
        .finally(() => {
          setIsLoading(false);
        });
    }
  };
  

  return (
    <>
      <Breadcrumbs
        mainTitle="Payment Reports"
        parent=""
        title="Payment Reports"
      />
      <Container fluid={true}>
        <Row>
          <Col sm="12">
            <Form onSubmit={handleSubmit(onFormSubmit)}>
              <Col sm="12">
                <Card>
                  <CardHeader>
                    <h5>{"Payments Reports"}</h5>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      {(user?.user_type === "A" || user?.user_type === "S") && (
                        <Col md="3">
                          <div className="form-group">
                            <Label className="from-label" htmlFor="aasra_name">
                              Aasra
                            </Label>
                            <div className="form-control-wrap">
                              <Select
                                className="select"
                                id="aasra_name"
                                {...register("aasra_name", {
                                  required: "Select Aasra is required",
                                })}
                                options={aasraList}
                                placeholder={"Select Aasra"}
                                value={watch("aasra_name")}
                                onChange={handleAsraList}
                              />
                              {errors.aasra_name && (
                                <p className="text-danger">
                                  {errors.aasra_name.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </Col>
                      )}
                      <Col md="3">
                        <div className="form-group">
                          <Label className="from-label" htmlFor="date">
                            Date
                          </Label>
                          <div className="">
                            <DatePicker
                              className="form-control"
                              selectsRange={true}
                              startDate={startDate}
                              endDate={endDate}
                              {...register("month", {
                                required: "Select Month is required",
                              })}
                              onChange={(date) => {
                                setValue("month", date);
                                setDateRange(date);
                                trigger("month");
                              }}
                              dateFormat="MM/yyyy"
                              showMonthYearPicker
                            />
                            {errors.month && (
                              <p className="text-danger">
                                {errors.month.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md="2" className="mt-top">
                        <Button color="primary" size="md">
                          Search
                        </Button>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Form>
          </Col>
        </Row>
      </Container>

      <Row>
        <Col sm="12">
          <MyDataTable
            name="Payments Reports"
            title="Payments Reports"
            isLoading={isLoading}
            columns={tableColumn}
            data={data}
            fileName={"Payments Report"}
          />
        </Col>
      </Row>
    </>
  );
};

export default PaymentReports;
