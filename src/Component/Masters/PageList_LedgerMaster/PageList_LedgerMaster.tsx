import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Table, Button, Row, Col, Input } from "reactstrap";
import AddEdit_LedgerMaster from "../AddEdit_LedgerMaster/AddEdit_LedgerMaster";
import { Fn_FillListData } from "../../../store/Functions";
import { API_WEB_URLS } from "../../../constants/constAPI";

const PageList_LedgerMaster = () => {
  const dispatch = useDispatch();
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [query, setQuery] = useState("");

  const loadList = async () => {
    try {
      setLoading(true);
      await Fn_FillListData(dispatch, (s: any) => {
        // Normalize possible response shapes to an array
        const list = s?.dataList ?? s?.data ?? s;
        if (Array.isArray(list)) setLedgers(list);
        else if (list && Array.isArray(list.dataList)) setLedgers(list.dataList);
        else setLedgers([]);
      }, "dataList", `${API_WEB_URLS.MASTER}/0/token/LedgerMaster/Id/0`);
    } catch (err) {
      console.error(err);
      setLedgers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadList(); }, []);

  const handleAdd = () => { setSelected(null); setIsOpenModal(true); };
  const handleEdit = (row: any) => { setSelected(row); setIsOpenModal(true); };

  const handleSaved = () => { setIsOpenModal(false); loadList(); };

  const filtered = ledgers.filter((l: any) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (l.Name || "").toLowerCase().includes(q) || String(l.Id).includes(q);
  });

  return (
    <div>
      <Row className="mb-2">
        <Col md={8}><h5>Ledger Master</h5></Col>
        <Col md={4} className="text-end">
          <Button color="primary" onClick={handleAdd}>Add Ledger</Button>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md={4}><Input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} /></Col>
      </Row>

      <Table bordered responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Ledger Group</th>
            <th>Branch</th>
            <th>Remark</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6}>Loading...</td></tr>
          ) : filtered.length ? (
            filtered.map((r: any, idx: number) => (
              <tr key={r.Id || idx}>
                <td>{idx + 1}</td>
                <td>{r.Name}</td>
                <td>{r.LedgerGroupName || r.LedgerGroup || r.F_LedgerGroup}</td>
                <td>{r.BranchName || r.F_BranchOffice}</td>
                <td>{r.Remark}</td>
                <td>
                  <Button color="sm" size="sm" onClick={() => handleEdit(r)}>Edit</Button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={6}>No records found</td></tr>
          )}
        </tbody>
      </Table>

      <AddEdit_LedgerMaster isOpen={isOpenModal} toggle={() => setIsOpenModal(!isOpenModal)} data={selected} onSaved={handleSaved} />
    </div>
  );
};

export default PageList_LedgerMaster;
