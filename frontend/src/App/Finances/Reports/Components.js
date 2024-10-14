import { Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { useAppContext } from "../../../Main";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

export const MenuPagamento = ({ handlechange, form, meses, anos }) => {
    return ( form &&
        <Row>
            <Form.Group className="mb-1" as={Col} xl={2} sm={3}>
                <Form.Select name='ano' onChange={handlechange} value={form ? form.ano : ''}>
                    {anos && anos.map(ano =>(
                        <option key={ano} value={ano}>{ano}</option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1" as={Col} xl={2} sm={3}>
                <Form.Select name='mes' onChange={handlechange} value={form ? form.mes : ''}>
                    {meses && meses.map( m =>(
                        <option key={m.number} value={m.number}>{m.name}</option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1" as={Col} xl={3} sm={6}>
                <Form.Control 
                    name="search"
                    value={form.search || ''}
                    onChange={handlechange}
                    type='text'
                    placeholder="Beneficiário, Fase, Categoria ou Classificação..."
                />
            </Form.Group>
            {form.ano && form.mes &&
                <Form.Group className="mb-1" as={Col} xl='auto' sm='auto'>
                    <Link className="btn btn-sm bg-danger-subtle text-danger" 
                        to={`${process.env.REACT_APP_API_URL}/finances/billings-report/?month=${form.mes}&year=${form.ano}&search${form.search || ''}`}
                    >
                        <FontAwesomeIcon icon={faFilePdf} className="me-1"/>PDF Report
                    </Link>
                </Form.Group>
            }
        </Row>
    );
};

export const MenuCobranca = ({ handlechange, form, meses, anos }) => {
    return ( form &&
        <Row className="gx-sm-1 gx-xl-3">
            <Form.Group className="mb-1" as={Col} xl={2} sm={2}>
                <Form.Select name='ano' onChange={handlechange} value={form ? form.ano : ''}>
                    {anos && anos.map(ano =>(
                        <option key={ano} value={ano}>{ano}</option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1" as={Col} xl={2} sm={2}>
                <Form.Select name='mes' onChange={handlechange} value={form ? form.mes : ''}>
                    {meses && meses.map( m =>(
                        <option key={m.number} value={m.number}>{m.name}</option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1" as={Col} xl={3} sm={3}>
                <Form.Control 
                    name="search"
                    value={form.search || ''}
                    onChange={handlechange}
                    type='text'
                    placeholder="Beneficiário, Fase ou Detalhamento..."
                />
            </Form.Group>
            {form.ano && form.mes &&
                <Form.Group className="mb-1" as={Col} xl='auto' sm='auto'>
                    <Link className="btn btn-sm bg-danger-subtle text-danger" 
                        to={`${process.env.REACT_APP_API_URL}/finances/revenues-report/?month=${form.mes}&year=${form.ano}&status=${form.status}&search${form.search || ''}`}
                    >
                        <FontAwesomeIcon icon={faFilePdf} className="me-1"/>PDF Report
                    </Link>
                </Form.Group>
            }
        </Row>
    );
};


export const TablePagamento = ({ pagamentos, status, click }) => {
    const {config: {theme}} = useAppContext();
    return (
        pagamentos ?
            <Table responsive className="mt-3">
                <thead className="bg-300">
                    <tr>
                        <th scope="col" className="text-center text-middle">Beneficiário</th>
                        <th scope="col" className="text-center text-middle">Categoria</th>
                        <th scope="col" className="text-center text-middle">Classificação</th>
                        <th scope="col" className="text-center text-middle">Data Ref.</th>
                        <th scope="col" className="text-center text-middle">Valor (R$)</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {pagamentos.filter(p => p.status === status).map(registro =>
                <tr key={registro.id} style={{cursor:'pointer'}} onClick={() => click(registro.uuid)} 
                    className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
                >
                    <td className="text-center text-middle fs--2">{registro.str_beneficiario}</td>
                    <td className="text-center text-middle fs--2">{registro.str_categoria}</td>
                    <td className="text-center text-middle fs--2">{registro.str_classificacao || '-'}</td>
                    <td className="text-center text-middle fs--2">
                        {registro.data ? new Date(registro.data).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                    </td>
                    <td className="text-center text-middle"> 
                        {registro.valor_pagamento ? Number(registro.valor_pagamento).toLocaleString('pt-BR', 
                            {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                    </td> 
                </tr>
                )} 
                </tbody>
            </Table>
        : <div className="text-center"><Spinner /></div>
    );
};
  

export const TableCobranca = ({ cobrancas, status, click }) => {
    const {config: {theme}} = useAppContext();
    return (
        cobrancas ? 
            <Table responsive className="mt-3">
                <thead className="bg-300">
                    <tr>
                        <th scope="col" className="text-center text-middle">Cliente</th>
                        <th scope="col" className="text-center text-middle">Produto</th>
                        <th scope="col" className="text-center text-middle">Detalhe Demanda</th>
                        <th scope="col" className="text-center text-middle">Status</th>
                        <th scope="col" className="text-center text-middle">Data Referência</th>
                        <th scope="col" className="text-center text-middle">Valor (R$)</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {cobrancas.filter(c => c.status === status).map(registro =>
                <tr key={registro.id} style={{cursor:'pointer'}} onClick={() => click(registro.uuid)} 
                    className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
                >
                    <td className="text-center text-middle fs--2">{registro.str_cliente}</td>
                    <td className="text-center text-middle fs--2">{registro.str_produto || '-'}</td>
                    <td className="text-center text-middle fs--2">{registro.str_detalhe || '-'}</td>
                    <td className="text-center text-middle fs--2 text-primary">{registro.str_status}</td>
                    <td className="text-center text-middle fs--2">
                        {registro.data ? new Date(registro.data).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                    </td>
                    <td className="text-center text-middle"> 
                        {registro.valor ? Number(registro.valor).toLocaleString('pt-BR', 
                            {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                    </td> 
                </tr>
                )} 
                </tbody>
            </Table>
        : <div className="text-center"><Spinner /></div>
    );
};
  