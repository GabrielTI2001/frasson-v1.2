import React,{useEffect, useState} from 'react';
import { Col, Row} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import CurrencyInput from 'react-currency-input-field';

const formatToCurrency = (number) => {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(number);
};

const parseCurrency = (currencyString) => {
    if (typeof(currencyString) === 'number'){
        return currencyString;
    }
    else{
        return parseFloat(currencyString.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    }

};

const ServicoEtapa = ({ change, data, servicos, etapas_current }) => {
    const { config: { theme } } = useAppContext();
    const [listdata, setListData] = useState([]);
    const [formData, setformData] = useState({});
    const [isListDataInitialized, setIsListDataInitialized] = useState(false);

    const insertData = (dados, etapa, s) => {
        const etapas = ['assinatura', 'protocolo', 'encerramento'];
        for (let i = 0; i < etapas.length; i++) {
            if (etapa === etapas[i]) {
                const letra = etapas[i].substr(0, 1).toUpperCase();
                const newdata = { etapa: letra, ...dados };
                if (listdata.filter(l => l.servico === s).length) {
                    const currentlist = listdata.filter(l => l.servico === s)[0];
                    if (currentlist.dados.filter(l => l.etapa === letra).length) {
                        setListData(listdata.map(l => l.servico === s
                            ? { ...l, dados: l.dados.map(d => d.etapa === letra ? { ...d, ...newdata } : d) }
                            : l)
                        );
                    } else {
                        setListData(listdata.map(l => l.servico === s
                            ? { ...l, dados: [...l.dados, newdata] }
                            : l
                        ));
                    }
                }
            }
        }
    };

    const calcPercent = (v, etapa, s) => {
        const valor = formData[`valor_${s}`] ? (parseCurrency(formData[`valor_${s}`])/ 100) * Number(v) : 0;
        insertData({ valor: valor !== '' && Number(valor), percentual: v ? Number(v) : '' }, etapa, s);
        setformData({
            ...formData,
            [`valor_${etapa}_${s}`]: valor, [`percentual_${etapa}_${s}`]: formData[`valor_${s}`] ? v : ''
        });
    };

    const handleFieldChange = (e, s) => {
        if (e.target.name.includes('percentual')) {
            calcPercent(e.target.value, e.target.name.split('_')[1], s);
        } else {
            const newValue = e.target.values.value;
            const fieldName = e.target.name;
            if (Number(formData[fieldName]) !== Number(newValue)) {
                setformData(prevFormData => ({
                    ...prevFormData,
                    [fieldName]: newValue, [`valor_assinatura_${s}`]: '', [`percentual_assinatura_${s}`]: '',
                    [`valor_protocolo_${s}`]: '', [`percentual_protocolo_${s}`]: '', [`valor_encerramento_${s}`]: '',
                    [`percentual_encerramento_${s}`]: ''
                }));
                setListData(prevListData => prevListData.map(l => 
                    l.servico === s ? { ...l, valor: e.target.values.float, dados: [] } : l
                ));
            }
        }
    };
    const calculateTotalValues = (list) => {
        const updatedListData = list.map(servico => {
            const valor = servico.dados.reduce((acc, curr) => acc + (curr.valor || 0), 0);
            return { ...servico, valor };
        });
        return updatedListData;
    };

    useEffect(() => {
        const initialListData = servicos.map(s => ({ servico: s.value, dados: [] }));
        const initialFormData = {};

        if (etapas_current && servicos) {
            etapas_current.forEach(etapa => {
                const etapaKey = etapa.etapa.split(' ')[0].toLowerCase();
                initialFormData[`percentual_${etapaKey}_${etapa.servico}`] = etapa.percentual;
                initialFormData[`valor_${etapaKey}_${etapa.servico}`] = etapa.valor;
                const servicoData = initialListData.find(item => item.servico === etapa.servico);
                if (servicoData) {
                    const etapaLabel = etapa.etapa.split(' ')[0];
                    servicoData.dados.push({
                        etapa: etapaLabel.charAt(0).toUpperCase(),
                        valor: etapa.valor,
                        percentual: etapa.percentual,
                    });
                }
            });
        }

        const calculatedListData = calculateTotalValues(initialListData);
        setformData(initialFormData);
        setListData(calculatedListData);
        setIsListDataInitialized(true);
    }, [servicos, etapas_current]);

    useEffect(() => {
        if (isListDataInitialized) {
            change(listdata);
            if (!Object.keys(formData).some(key => /^valor_\d+$/.test(key))){
                let updatedFormData = {};
                listdata.map(servico => {
                    const valor = servico.dados.reduce((acc, curr) => acc + (curr.valor || 0), 0);
                    updatedFormData[`valor_${servico.servico}`] = valor;
                    return { ...servico, valor };
                });
                setformData({...formData, ...updatedFormData})
            }
        }
    }, [listdata, isListDataInitialized]);

    return (
        listdata && listdata.length > 0 && servicos && servicos.map(s =>
            <div className='border border-1 p-2 rounded-2 mb-2' key={s.value}>
                <Row>
                    <Col xl={12} className='text-middle d-flex align-items-center mb-1'>
                        <h5 className='fw-bold fs--1'>{s.label} - Etapas</h5>
                    </Col>
                    <Form.Group className="mb-2" as={Col} xl={5} sm={6}>
                        <Form.Label className='fw-bold mb-1'>Valor Total (R$)*</Form.Label>
                        <CurrencyInput
                            className='form-control'
                            decimalsLimit={2}
                            value={formData[`valor_${s.value}`] || ''}
                            decimalSeparator="," groupSeparator="."
                            intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                            name={`valor_${s.value}`}
                            onValueChange={(value, name, values) => handleFieldChange({target:{name:name, values:values}}, s.value)}
                        />
                    </Form.Group>
                </Row>
                <Row className=''>
                    <Form.Group as={Col} xl={7} sm={7} className='mb-1'>
                        <Form.Label className='mb-0 fw-bold'>Percentual Assinatura Contrato</Form.Label>
                        <Form.Control
                            type='number'
                            value={formData[`percentual_assinatura_${s.value}`] || ''}
                            onChange={(e) => handleFieldChange(e, s.value)}
                            name={`percentual_assinatura_${s.value}`}
                        />
                    </Form.Group>
                    <Form.Group as={Col} xl={4} sm={4} className='mb-1'>
                        <Form.Label className='mb-0 fw-bold'>Valor</Form.Label>
                        <Form.Label className='mb-0 fs--1 d-block'>R$ {formData[`valor_assinatura_${s.value}`] ? 
                           Number(formData[`valor_assinatura_${s.value}`]).toLocaleString('pt-BR', {minimumFractionDigits:2})
                            : ''}
                        </Form.Label>
                    </Form.Group>
                </Row>
                <Row>

                    <Form.Group as={Col} xl={7} sm={7} className='mb-1'>
                        <Form.Label className='mb-0 fw-bold'>Percentual Protocolo</Form.Label>
                        <Form.Control
                            type='number'
                            value={formData[`percentual_protocolo_${s.value}`] || ''}
                            onChange={(e) => handleFieldChange(e, s.value)}
                            name={`percentual_protocolo_${s.value}`}
                        />
                    </Form.Group>
                    <Form.Group as={Col} xl={4} sm={4} className='mb-1'>
                        <Form.Label className='mb-0 fw-bold'>Valor</Form.Label>
                        <Form.Label className='mb-0 fs--1 d-block'>R$ {formData[`valor_protocolo_${s.value}`] ? 
                            Number(formData[`valor_protocolo_${s.value}`]).toLocaleString('pt-BR', {minimumFractionDigits:2})
                            : ''}
                        </Form.Label>
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} xl={7} sm={7} className='mb-1'>
                        <Form.Label className='mb-0 fw-bold'>Percentual Encerramento</Form.Label>
                        <Form.Control
                            type='number'
                            value={formData[`percentual_encerramento_${s.value}`] || ''}
                            onChange={(e) => handleFieldChange(e, s.value)}
                            name={`percentual_encerramento_${s.value}`}
                        />
                    </Form.Group>
                    <Form.Group as={Col} xl={4} sm={4} className='mb-1'>
                        <Form.Label className='mb-0 fw-bold'>Valor</Form.Label>
                        <Form.Label className='mb-0 fs--1 d-block'>R$ {formData[`valor_encerramento_${s.value}`] ? 
                            Number(formData[`valor_encerramento_${s.value}`]).toLocaleString('pt-BR', {minimumFractionDigits:2})
                            : ''}
                        </Form.Label>
                    </Form.Group>
                </Row>
            </div>
        )
    );
};

export default ServicoEtapa;


