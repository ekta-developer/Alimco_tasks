import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import Select from "react-select/creatable";
import { Button, Card, CardBody, Col, Row } from "reactstrap";
import { Breadcrumbs, H3, H6, P } from "../../AbstractElements";
import { listCategoryMasterAPI } from "../../api/master";
import {
  categoryWiseProductListAPI,
  productWiseRepairListAPI,
} from "../../api/dropdowns";
import { repairProductAPI } from "../../api/aasra";
import { toast } from "react-toastify";
import logo from "../../assets/images/logo/logo-color.png";
import { handleClosedTicketPrint } from "../../util/myPrint";

const TicketDetail = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem("accessToken");
  const paymentOptions = ["UPI", "Cash", "HDFC Payment Gateway"];
  const [selectedOption, setSelectedOption] = useState(paymentOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const tokenHeader = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      Authorization: "Bearer " + `${userToken}`,
    },
  };
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [handlingList, setHandlingList] = useState([]);
  const [warranty, setWarranty] = useState(null);
  const [warrantyMessage, setWarrantyMessage] = useState(
    "please select warranty status"
  );
  const [item, setItem] = useState(location?.state?.ticket);
  useEffect(() => {
    listCategory();
  }, []);

  const listCategory = () => {
    listCategoryMasterAPI({}, tokenHeader)
      .then((res) => {
        if (res.data.status == "success") {
          let a = res.data.data.data.map((item) => ({
            value: item.id,
            label: item.category_name,
          }));
          setCategoryList(a);
        } else {
          console.log("else list", res.data);
        }
      })
      .catch((err) => {
        console.log("catch", err);
      });
  };
  const [rows, setRows] = useState([
    {
      warranty: null,
      category: null,
      product: null,
      repair: null,
      qty: 1,
      price: 0,
      serviceCharge: 0,
      gst: 0,
      amount: 0,
    },
  ]);
  const handleCategoryChange = (e, index) => {
    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      category: e,
    };
    setRows(newRows);
    const body = {
      category_id: e.value,
    };
    categoryWiseProductListAPI(body, tokenHeader)
      .then((res) => {
        if (res.data.status == "success") {
          setProductList(res.data.data.productData);
          console.log("product list", res.data.data);
        } else {
          console.log("err else", res.data.message);
        }
      })
      .catch((err) => {
        console.log("error", err);
      });
  };
  const handleRepairingChange = (selectedOption, index) => {
    const newRows = [...rows];
    const product = handlingList?.find((p) => p.value === selectedOption.value);

    const price = product ? product.price : 0;
    const serviceCharge = product ? product.serviceCharge : 0;
    const gst = product ? product.gst : 0;

    // Calculate amount and ensure proper toFixed usage
    const amount = (price + serviceCharge).toFixed(2);

    // Log values to debug
    console.log("Price:", price);
    console.log("Service Charge:", serviceCharge);
    console.log("GST:", gst);
    console.log("Amount before toFixed:", (price + serviceCharge) * (1 + gst));
    console.log("Amount after toFixed:", amount);

    newRows[index] = {
      ...newRows[index],
      repair: selectedOption,
      qty: 1,
      price: price,
      serviceCharge: serviceCharge,
      gst: gst,
      amount: parseFloat(amount), // Convert the fixed string back to a number if necessary
    };

    setRows(newRows);
  };

  const handleProductChange = (e, index) => {
    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      product: e,
    };
    const body = {
      repair_id: e.value,
    };
    productWiseRepairListAPI(body, tokenHeader)
      .then((res) => {
        if (res.data.status == "success") {
          console.log("product list", res.data.data);
          setHandlingList(res.data.data);
        } else {
          console.log("err else", res.data.message);
        }
      })
      .catch((err) => {
        console.log("error", err);
      });
    // const product = productList.find((p) => p.value === selectedOption.value);
    // const price = product ? product.price : 0;
    // const serviceCharge = product ? product.serviceCharge : 0;
    // const gst = product ? product.gst : 0;
    // const amount = (price + serviceCharge) * (1 + gst);

    // newRows[index] = {
    //   ...newRows[index],
    //   product: selectedOption,
    //   qty: 1,
    //   price: price,
    //   serviceCharge: serviceCharge,
    //   gst: gst,
    //   amount: amount,
    // };
    setRows(newRows);
  };
  const handleWarrantyChange = (e) => {
    setWarranty(e);
    const newRows = [...rows];
    newRows.forEach((row) => {
      row.warranty = e.value; // Update the warranty value for each row
      row.ticket_id = location?.state?.ticket?.ticket_id;
    });
    setRows(newRows);
  };
  const handleQtyChange = (e, index) => {
    const newRows = [...rows];
    const qty = parseInt(e.target.value, 10);

    // Check if qty is a valid number
    if (isNaN(qty)) {
      console.error("Invalid quantity:", e.target.value);
      return;
    }

    const row = newRows[index];

    // Calculate amount safely
    const amount = (row.price + row.serviceCharge) * qty;

    // Check if amount is a number before applying toFixed
    const formattedAmount = !isNaN(amount) ? amount.toFixed(2) : "0.00";

    // Log values to debug
    newRows[index].qty = qty;
    newRows[index].amount = parseFloat(formattedAmount); // Convert back to number if necessary

    setRows(newRows);
  };
  const handleOldSrChange = (e, index) => {
    const newRows = [...rows];
    const old_sr_no = e.target.value;
    // Log values to debug
    newRows[index].old_sr_no = old_sr_no;

    setRows(newRows);
  };
  const handleNewSrChange = (e, index) => {
    const newRows = [...rows];
    const new_sr_no = e.target.value;
    // Log values to debug
    newRows[index].new_sr_no = new_sr_no;

    setRows(newRows);
  };

  const addNewRow = () => {
    setRows([
      ...rows,
      {
        product: null,
        qty: 1,
        price: "",
        serviceCharge: "",
        gst: "",
        amount: "",
      },
    ]);
  };

  const removeRow = (index) => {
    const newRows = rows.filter((row, rowIndex) => rowIndex !== index);
    setRows(newRows);
  };
  const handleUpdate = () => {
    if (warranty != null) {
      if (warranty?.value) {
        generateRepair();
      } else {
        switch (selectedOption) {
          case "UPI":
            toast.success("upi");
            // Handle UPI
            break;
          case "Cash":
            generateRepair("Cash");
            break;
          case "HDFC Payment Gateway":
            toast.success("hdfc");
            // Handle HDFC Payment Gateway
            break;
          default:
            break;
        }
      }
    }
  };
  const calculateTotalAmount = () => {
    if (warranty?.value) {
      console.log("in warranty");
    } else {
      console.log("out of warranty");
    }

    return rows.reduce((total, row) => total + (row.amount || 0), 0);
  };
  const calculateTotalWithGST = () => {
    if (warranty?.value) {
      // Calculate the total amount without GST
      const totalWithoutGST = rows.reduce(
        (total, row) => total + (row.serviceCharge || 0),
        0
      );

      // Calculate GST (18% of the total amount)
      const gstAmount = totalWithoutGST * 0.18;

      // Return the total amount including GST
      // return totalWithoutGST + gstAmount;
      // returning )
      return 0;
    } else {
      // Calculate the total amount without GST
      const totalWithoutGST = rows.reduce(
        (total, row) => total + (row.amount || 0),
        0
      );

      // Calculate GST (18% of the total amount)
      const gstAmount = totalWithoutGST * 0.18;

      // Return the total amount including GST
      return totalWithoutGST + gstAmount;
    }
  };

  const calculateServiceCharge = () => {
    return rows.reduce((total, row) => total + (row.serviceCharge || 0), 0);
  };
  const calculateDiscount = () => {
    if (warranty?.value) {
      return rows.reduce((total, row) => total + (row.amount || 0), 0);
    } else {
      return 0;
    }
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const generateRepair = (data) => {
    const transformedRows = rows.map((item) => {
      return {
        mode: data,
        warranty: warranty?.value,
        categoryValue: item.category.value,
        categoryLabel: item.category.label,
        productValue: item.product.value,
        productLabel: item.product.label,
        repairValue: item.repair.value,
        repairLabel: item.repair.label,
        repairServiceCharge: item.repair.serviceCharge,
        repairTime: item.repair.repair_time,
        repairPrice: item.repair.price,
        repairGst: item.repair.gst,
        qty: item.qty,
        price: item.price,
        serviceCharge: item.serviceCharge,
        gst: item.gst,
        amount: item.amount,
        ticket_id: location?.state?.ticket?.ticket_id,
        new_sr_no: item.new_sr_no || "n/a",
        old_sr_no: item?.old_sr_no || "n/a",
      };
    });

    repairProductAPI(transformedRows, tokenHeader)
      .then((res) => {
        if (res.data.status == "success") {
          setIsLoading(false);
          toast.success(res.data.message);
          navigate("/tickets");
        } else {
          toast.error(res.data.message);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  return (
    <>
      <Breadcrumbs mainTitle="Ticket Detail" parent="" title="Ticket Detail" />

      <Row>
        {/* <Col xxl={location?.state?.ticket?.status=='Closed'?'12':'8'} className="box-col-6 order-xxl-0 order-1"> */}
        <Col xxl={"12"} className="box-col-6 order-xxl-0 order-1">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center product-page-details">
                <H3>{item.product_name}</H3>
                <span className="float-right">
                  Ticket ID : <b>{item.ticket_id}</b>
                  <br></br>
                  Customer Name: <b>{item?.customer_name}</b>
                  <br></br>
                  Customer Mobile: <b>{item?.mobile}</b>
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <P>{item.description}</P>
                  {location?.state?.ticket?.status == "Closed" ? null : (
                    <>
                      <Select
                        className="react-select-container"
                        options={[
                          { value: false, label: "Out of Warranty" },
                          { value: true, label: "In warranty" },
                        ]}
                        value={warranty}
                        onChange={(e) => handleWarrantyChange(e)}
                        required
                      />
                      {warranty == null ? (
                        <span
                          className="invalid"
                          style={{
                            color: "#e85347",
                            fontSize: "11px",
                            fontStyle: "italic",
                          }}
                        >
                          {warrantyMessage}
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
                <div>
                  <span
                    className={
                      item.status == "Closed"
                        ? "badge badge-light-success"
                        : item.status == "Open"
                        ? "badge badge-light-warning"
                        : "badge badge-light-primary"
                    }
                  >
                    {item.status}
                  </span>
                </div>
              </div>
              {location?.state?.ticket?.status == "Closed" ? (
                <>
                  <table
                    className="table table-bordered table-scroll mt-3"
                    id="productTable"
                  >
                    <thead>
                      <tr>
                        <th scope="col">Category</th>
                        <th scope="col">Product</th>
                        <th scope="col">Repairing and Handling</th>
                        <th scope="col">Old Part Sr.No.</th>
                        <th scope="col">New Part Sr.No.</th>
                        <th scope="col">Qty</th>
                        <th scope="col">Price</th>
                        <th scope="col">Service Charge</th>
                        {/* <th scope="col">GST (%)</th> */}
                        <th scope="col">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {location?.state?.ticket?.ticketDetail?.map(
                        (item, index) => (
                          <>
                            <tr key={index}>
                              <td>{item?.categoryLabel}</td>
                              <td>{item?.productLabel}</td>
                              <td>{item?.repairLabel}</td>
                              <td>{item?.old_sr_no || "n/a"}</td>
                              <td>{item?.new_sr_no || "n/a"}</td>
                              <td>{item?.qty}</td>
                              <td>{item?.price}</td>
                              <td>{item?.serviceCharge}</td>
                              <td>
                                {item.qty * item.price + item.serviceCharge}
                              </td>
                            </tr>
                          </>
                        )
                      )}
                    </tbody>
                  </table>
                  <div className="offset-md-9 col-md-3 mt-4">
                    <table className="table table-striped table-sm">
                      <tbody>
                        <tr>
                          <td className="bold">GST</td>
                          <td>
                            <span>
                              {" "}
                              {location?.state?.ticket?.ticketDetail[0]
                                ?.repairGst * 100 || 0}
                              %
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td className="bold">Shipping</td>
                          <td>
                            <span>
                              {" "}
                              {location?.state?.ticket?.ticketDetail.reduce(
                                (total, row) =>
                                  total +
                                  (row.qty * row.price + row.serviceCharge),
                                0
                              )}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <span className="font-weight-bold">
                              Grand Total
                            </span>
                          </td>
                          <td>
                            <span className="font-weight-bold">
                              {" "}
                              {location?.state?.ticket?.ticketDetail.reduce(
                                (total, row) => total + row.amount,
                                0
                              )}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <hr />
                  <table
                    className="table table-bordered table-scroll mt-3"
                    id="productTable"
                  >
                    <thead>
                      <tr>
                        <th scope="col">Category</th>
                        <th scope="col">Product</th>
                        <th scope="col">Repairing and Handling</th>
                        <th scope="col">Old Part Sr.No.</th>
                        <th scope="col">New Part Sr.No.</th>
                        <th scope="col">Qty</th>
                        <th scope="col">Price</th>
                        <th scope="col">Service Charge</th>
                        {/* <th scope="col">GST (%)</th> */}
                        <th scope="col">Amount</th>
                        <th scope="col">
                          <button
                            className="btn btn-info"
                            id="addProduct"
                            onClick={addNewRow}
                          >
                            <i className="fa fa-plus"></i>
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={index}>
                          <td>
                            <Select
                              className="react-select-container"
                              options={categoryList}
                              value={row.category}
                              onChange={(e) => handleCategoryChange(e, index)}
                            />
                          </td>
                          <td>
                            <Select
                              className="react-select-container"
                              options={productList}
                              value={row.product}
                              onChange={(e) => handleProductChange(e, index)}
                            />
                          </td>
                          <td>
                            <Select
                              className="react-select-container"
                              options={handlingList}
                              value={row.handling}
                              onChange={(e) => handleRepairingChange(e, index)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.repair_time}
                              onChange={(e) => handleOldSrChange(e, index)}
                              // min="1"
                              className="form-control"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.repair_time}
                              onChange={(e) => handleNewSrChange(e, index)}
                              // min="1"
                              className="form-control"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={row.qty}
                              onChange={(e) => handleQtyChange(e, index)}
                              min="1"
                              className="form-control"
                              pattern="\d*"
                              onInput={(e) => {
                                e.target.value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                ); // Replace non-digit characters, including the decimal point
                              }}
                            />
                          </td>
                          <td>{row.price}</td>
                          <td>{row.serviceCharge}</td>
                          {/* <td>{(row.gst * 100)?.toFixed(2) || 0}%</td> */}
                          <td>{row?.amount || 0}</td>
                          <td>
                            <button
                              className="btn btn-danger remove"
                              onClick={() => removeRow(index)}
                            >
                              <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <Row>
                <Col>
                  {" "}
                  <div>
                    {location?.state?.ticket?.status == "Closed" ? (
                      <>
                        <Button
                          className="m-r-10 m-t-10"
                          onClick={() =>
                            handleClosedTicketPrint(location?.state?.ticket)
                          }
                        >
                          <i className="fa fa-print me-1"></i>
                          Print
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={"/chat"}
                          state={{ state: location?.state?.ticket }}
                        >
                          <Button color="primary" className="m-r-10 m-t-10">
                            <i className="fa fa-comments me-1"></i>
                            Chat
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </Col>
                <Col>
                 <Row>
                 <div className="col-md-4 col-md-3 mt-4 d-flex flex-column justify-content-end" >
                    {warranty?.value ? null : (
                      <>
                        {" "}
                        {paymentOptions.map((option, index) => (
                          <label
                            className="d-block"
                            htmlFor={`option-${index}`}
                            key={index}
                          >
                            <input
                              className="radio_animated"
                              id={`option-${index}`}
                              type="radio"
                              name="payment-option"
                              value={option}
                              checked={selectedOption === option}
                              onChange={handleOptionChange}
                            />
                            {option}
                          </label>
                        ))}
                      </>
                    )}
                    {warranty?.value ? (
                      <Button
                        color="success"
                        onClick={() => handleUpdate()}
                        className="m-t-10"
                      >
                        <i className="fa fa-wrench me-1"></i>
                        {"Repair"}
                      </Button>
                    ) : (
                      <Button
                        color="success"
                        onClick={() => handleUpdate()}
                        className="m-t-10"
                      >
                        <i className="fa fa-wrench me-1"></i>
                        {"Make Payment"}
                      </Button>
                    )}
                  </div>
                  <div className="col-md-8 col-md-3 mt-4">
                    <H6>Payment Summary</H6>
                    <table className="table table-striped table-sm">
                      <tbody>
                        <tr>
                          <td className="bold">GST</td>
                          <td>
                            <span> {handlingList[0]?.gst * 100 || 0}%</span>
                          </td>
                        </tr>

                        <tr>
                          <td className="bold">Discount Amount</td>
                          <td>
                            <span> {calculateDiscount()?.toFixed(2)}</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="bold">Service Charge</td>
                          <td>
                            <span> {calculateServiceCharge().toFixed(2)}</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="bold">Total Amount</td>
                          <td>
                            <span> {calculateTotalAmount().toFixed(2)}</span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <span className="font-weight-bold">
                              Grand Total
                            </span>
                          </td>
                          <td>
                            <span className="font-weight-bold">
                              {" "}
                              {calculateTotalWithGST().toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                 </Row>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
        {/* {location?.state?.ticket?.status == "Closed" ? null : (
          <Col xxl="4" className="box-col-6 order-xxl-0 order-1">
            <Card>
              <CardBody>
                <div className="col-md-12 col-md-3 mt-4">
                  <H6>Payment Summary</H6>
                  <table className="table table-striped table-sm">
                    <tbody>
                      <tr>
                        <td className="bold">GST</td>
                        <td>
                          <span> {handlingList[0]?.gst * 100 || 0}%</span>
                        </td>
                      </tr>

                      <tr>
                        <td className="bold">Discount Amount</td>
                        <td>
                          <span> {calculateDiscount()?.toFixed(2)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="bold">Service Charge</td>
                        <td>
                          <span> {calculateServiceCharge().toFixed(2)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="bold">Total Amount</td>
                        <td>
                          <span> {calculateTotalAmount().toFixed(2)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="font-weight-bold">Grand Total</span>
                        </td>
                        <td>
                          <span className="font-weight-bold">
                            {" "}
                            {calculateTotalWithGST().toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {warranty?.value ? null : (
                    <>
                      {" "}
                      {paymentOptions.map((option, index) => (
                        <label
                          className="d-block"
                          htmlFor={`option-${index}`}
                          key={index}
                        >
                          <input
                            className="radio_animated"
                            id={`option-${index}`}
                            type="radio"
                            name="payment-option"
                            value={option}
                            checked={selectedOption === option}
                            onChange={handleOptionChange}
                          />
                          {option}
                        </label>
                      ))}
                    </>
                  )}
                  {warranty?.value ? (
                    <Button
                      color="success"
                      onClick={() => handleUpdate()}
                      className="m-t-10"
                    >
                      <i className="fa fa-wrench me-1"></i>
                      {"Repair"}
                    </Button>
                  ) : (
                    <Button
                      color="success"
                      onClick={() => handleUpdate()}
                      className="m-t-10"
                    >
                      <i className="fa fa-wrench me-1"></i>
                      {"Make Payment"}
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        )} */}
      </Row>
    </>
  );
};

export default TicketDetail;
