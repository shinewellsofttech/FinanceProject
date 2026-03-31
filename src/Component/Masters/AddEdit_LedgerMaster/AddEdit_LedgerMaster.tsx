import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Modal, ModalHeader, ModalBody, FormGroup, Label, Input, Col, Row, Button } from "reactstrap";
import { Fn_AddEditData, Fn_FillListData } from "../../../store/Functions";
import { API_WEB_URLS } from "../../../constants/constAPI";

interface Props {
  isOpen?: boolean;
  toggle?: () => void;
  onSaved?: () => void;
  data?: any;
}

const AddEdit_LedgerMaster = ({ isOpen, toggle, onSaved, data }: Props) => {
  const dispatch = useDispatch();
  const [ledgerGroups, setLedgerGroups] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [localOpen, setLocalOpen] = useState(false);

  const modalOpen = typeof isOpen === "boolean" ? isOpen : localOpen;
  const toggleModal = toggle ?? (() => setLocalOpen((s) => !s));

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const loggedUserId = String(currentUser?.uid ?? currentUser?.id ?? "");

  useEffect(() => {
    // Fetch LedgerGroup from LedgerGroupMaster and Branch from BranchOffice
    Fn_FillListData(dispatch, (s: any) => { setLedgerGroups(s.dataList || s); }, "dataList", `${API_WEB_URLS.MASTER}/0/token/${API_WEB_URLS.LedgerGroupMaster}/Id/0`).catch(console.error);
    Fn_FillListData(dispatch, (s: any) => { setBranches(s.dataList || s); }, "dataList", `${API_WEB_URLS.MASTER}/0/token/BranchOffice/Id/0`).catch(console.error);
  }, [dispatch]);

  const initialValues = {
    Id: data?.Id ?? 0,
    Name: data?.Name ?? "",
    LedgerGroupId: data?.F_LedgerGroup ?? data?.LedgerGroupId ?? "",
    BranchId: data?.F_BranchOffice ?? data?.BranchId ?? localStorage.getItem("F_BranchOffice") ?? "",
    Remark: data?.Remark ?? "",
  };

  const validationSchema = Yup.object({
    Name: Yup.string().required("Name is required"),
    LedgerGroupId: Yup.string().required("Ledger Group is required"),
  });

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const fd = new FormData();
      fd.append("Name", values.Name);
      fd.append("F_LedgerGroup", String(values.LedgerGroupId));
      fd.append("F_BranchOffice", String(values.BranchId || ""));
      fd.append("Remark", values.Remark || "");
      fd.append("UserId", loggedUserId);

      await Fn_AddEditData(
        dispatch,
        () => { if (onSaved) onSaved(); },
        { arguList: { id: values.Id || 0, formData: fd } },
        `LedgerMaster/0/token`,
        true,
        "ledgerid",
        undefined,
        undefined
      );
      toggleModal();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={modalOpen} toggle={toggleModal} size="md">
      <ModalHeader toggle={toggle}>{data ? "Edit Ledger" : "Add Ledger"}</ModalHeader>
      <ModalBody>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
          {({ values, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Name</Label>
                <Input name="Name" value={values.Name} onChange={handleChange} onBlur={handleBlur} />
              </FormGroup>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Ledger Group</Label>
                    <Input type="select" name="LedgerGroupId" value={values.LedgerGroupId} onChange={handleChange}>
                      <option value="">Select Group...</option>
                      {ledgerGroups.map((g: any) => (
                        <option key={g.Id} value={g.Id}>{g.Name}</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Branch</Label>
                    <Input type="select" name="BranchId" value={values.BranchId} onChange={handleChange}>
                      <option value="">Select Branch...</option>
                      {branches.map((b: any) => (
                        <option key={b.Id} value={b.Id}>{b.Name || b.BranchName || b.DisplayName}</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label>Remark</Label>
                <Input type="textarea" name="Remark" value={values.Remark} onChange={handleChange} />
              </FormGroup>

              <div className="d-flex justify-content-end gap-2">
                <Button color="secondary" type="button" onClick={toggle}>Cancel</Button>
                <Button color="primary" type="submit" disabled={(isSubmitting as boolean)}>{(isSubmitting as boolean) ? 'Saving...' : 'Save'}</Button>
              </div>
            </Form>
          )}
        </Formik>
      </ModalBody>
    </Modal>
  );
};

export default AddEdit_LedgerMaster;
