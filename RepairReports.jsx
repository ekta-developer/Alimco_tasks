import React, { useEffect, useState } from "react";
import { Breadcrumbs } from "../../AbstractElements";
import { Card, CardBody, Col, Input, Label, Row } from "reactstrap";
import CreatableSelect from "react-select/creatable";
import { useForm } from "react-hook-form";
import MyDataTable from "../../Components/MyComponents/MyDataTable";
import { repairReportSearchAPI } from "../../api/user";
import { aasraDropdownList, aasraListAPI } from "../../api/dropdowns";
import { toast } from "react-toastify";
const RepairReports = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm();
  const [tableData, setTableData] = useState([]);
  const [aasraList, setAasraList] = useState([]);
  const userToken = localStorage.getItem("accessToken");
  const tokenHeader = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      Authorization: "Bearer " + `${userToken}`,
    },
  };
  const handleAasraId = (selectedOption) => {
    setValue("aasraId", selectedOption);
    trigger("aasraId");
  };

  const handleWarrenty = (selectedOption) => {
    setValue("warranty", selectedOption);
    trigger("warranty");
  };

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Warranty",
      selector: (row) => (row.warranty ? "Yes" : "No"),
      sortable: true,
    },
    // {
    //   name: "Category Value",
    //   selector: (row) => row.categoryValue,
    //   sortable: true,
    // },
    {
      name: "Category",
      selector: (row) => row.categoryLabel,
      sortable: true,
    },
    // {
    //   name: "Part Number",
    //   selector: (row) => row.productValue,
    //   sortable: true,
    // },
    {
      name: "Product",
      selector: (row) => row.productLabel,
      sortable: true,
    },
    // {
    //   name: "Part Number",
    //   selector: (row) => row.repairValue,
    //   sortable: true,
    // },
    {
      name: "Repair",
      selector: (row) => row.repairLabel,
      sortable: true,
    },
    {
      name: "Repair Service Charges",
      selector: (row) => row.repairServiceCharge,
      sortable: true,
    },
    {
      name: "Repair Time",
      selector: (row) => row.repairTime,
      sortable: true,
    },
    {
      name: "Repair Price",
      selector: (row) => row.repairPrice,
      sortable: true,
    },
    {
      name: "Repair GST",
      selector: (row) => row.repairGst,
      sortable: true,
    },
    {
      name: "Quantity",
      selector: (row) => row.qty,
      sortable: true,
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
    },
    {
      name: "Service Charges",
      selector: (row) => row.serviceCharge,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
    },
    {
      name: "Ticket Id",
      selector: (row) => row.ticket_id,
      sortable: true,
    },
    {
      name: "Created",
      selector: (row) => row.createdAt,
      sortable: true,
    },
    {
      name: "Updated",
      selector: (row) => row.updatedAt,
      sortable: true,
    },
  ];

  useEffect(() => {
    getAasraDropdown();
  }, []);

  const getAasraDropdown = () => {

    aasraListAPI()
      .then((res) => {
        if (res.data.status == "success") {
          console.log("res", res.data);
          setAasraList(res.data.data);
        } else {
          console.log("else list", res.data);
        }
      })
      .catch((err) => {
        console.log("catch", err);
      });

  }

  const onSubmit = (data) => {
    // Check if aasraId and warranty are defined before accessing their values
    const aasraIdValue = data.aasraId ? data.aasraId.value : null;
    const warrantyValue = data.warranty ? data.warranty.value : null;

    const bodyData = {
      aasra_id: aasraIdValue,
      warranty: warrantyValue,
    };
    console.log(tokenHeader, "dwww");

    // Call the repairReportSearchAPI with the bodyData
    repairReportSearchAPI(bodyData, tokenHeader)
      .then((res) => {
        if (res.data.status === "success") {
          console.log(res.data, "dddd");
          toast.success(res.data.message)
          setTableData(res.data?.data.repairs);
        } else {
          toast.error(res.data.message)
          console.log("else list", res.data);
        }
      })
      .catch((err) => {
        console.log("catch", err);
      });
  };
  return (
    <>
      <Breadcrumbs
        mainTitle="Repair Reports"
        parent=""
        title="Repair Reports"
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col sm="4">
                <Label className="form-label">Aasra ID</Label>
                <CreatableSelect
                  className="select"
                  id="aasraId"
                  {...register("aasraId", {
                    required: "AasraId is required",
                  })}
                  options={aasraList}
                  placeholder={"Select aasraId"}
                  value={watch(`aasraId`)}
                  onChange={handleAasraId}
                />
                {errors.aasraId && (
                  <p className="text-danger">{errors.aasraId.message}</p>
                )}
              </Col>
              <Col sm="4">
                <Label className="form-label">Warranty</Label>
                <CreatableSelect
                  className="select"
                  id="warranty"
                  {...register("warranty", {
                    required: "warranty is required",
                  })}
                  options={[
                    { label: "YES", value: "1" },
                    { label: "NO", value: "0" },
                  ]}
                  placeholder={"Select warranty"}
                  value={watch(`warranty`)}
                  onChange={handleWarrenty}
                />
                {errors.warranty && (
                  <p className="text-danger">{errors.warranty.message}</p>
                )}
              </Col>
              <Col sm="4" className="mt-4">
                <Label></Label>
                <button className="btn btn-primary" type="submit">
                  Search
                </button>
              </Col>
            </Row>{" "}
          </form>
        </CardBody>
      </Card>

      <Col sm="12">
        <MyDataTable
         export
          search="Search By Category / Product / Ticket Id"
          name={"Repair Reports"}
          title="Repair Reports"
          data={tableData}
          // isLoading={isLoading}
          columns={columns}
          fileName={"Repair Reports"}
        />
      </Col>
    </>
  );
};

export default RepairReports;
