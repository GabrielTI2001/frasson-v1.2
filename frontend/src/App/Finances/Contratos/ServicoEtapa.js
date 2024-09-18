import React,{useEffect, useState} from 'react';
import { Button, Col, Row} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import CurrencyInput from 'react-currency-input-field';
import { FormCreateEtapa } from './FormContrato';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

const formatTovar = (text) => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
};

const parseCurrency = (currencyString) => {
    if (typeof(currencyString) === 'number'){
        return currencyString;
    }
    else{
        return parseFloat(currencyString.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    }

};

const ServicoEtapa = ({ change, servicos, etapas_current }) => {
    const { config: { theme } } = useAppContext();
    const [listdata, setListData] = useState([]);
    const [etapas, setEtapas] = useState(['Assinatura Contrato', 'Protocolo', 'Encerramento']);
    const [newetapas, setNewEtapas] = useState(etapas_current 
        ? etapas_current.filter(e => !etapas.some(r=> r === e.etapa)).map(e => ({e:e.etapa, s:e.servico})) : 
    [])
    const [formData, setformData] = useState({});
    const [isListDataInitialized, setIsListDataInitialized] = useState(false);
    console.log(listdata)

    const insertData = (dados, etapa, s) => {
        const etapasl = [...etapas.map(e => formatTovar(e)), ...newetapas.filter(e => e.s === s).map(e => e.e)]
        for (let i = 0; i < etapasl.length; i++) {
            if (etapa === etapasl[i]) {
                const letra = etapasl[i];
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
                const newdata = {};
                etapas.forEach(e => {
                    newdata[`valor_${formatTovar(e)}_${s}`] = '';
                    newdata[`percentual_${formatTovar(e)}_${s}`] = '';
                })
                newetapas.filter(e => e.s === s).forEach(e => {
                    newdata[`valor_${formatTovar(e.e)}_${s}`] = '';
                    newdata[`percentual_${formatTovar(e.e)}_${s}`] = '';
                })
                setformData({
                    ...formData, [fieldName]: newValue, ...newdata
                });
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
                const etapaKey = etapa.etapa;
                initialFormData[`percentual_${etapaKey}_${etapa.servico}`] = etapa.percentual;
                initialFormData[`valor_${etapaKey}_${etapa.servico}`] = etapa.valor;
                const servicoData = initialListData.find(item => item.servico === etapa.servico);
                if (servicoData) {
                    servicoData.dados.push({
                        etapa: etapaKey,
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
                {etapas.map((e, index) =>
                    <Row key={e}>
                        <Form.Group as={Col} xl={7} sm={7} className='mb-1'>
                            <Form.Label className='mb-0 fw-bold'>Percentual {e}</Form.Label>
                            <Form.Control
                                type='number'
                                value={formData[`percentual_${formatTovar(e)}_${s.value}`] || ''}
                                onChange={(e) => handleFieldChange(e, s.value)}
                                name={`percentual_${formatTovar(e)}_${s.value}`}
                            />
                        </Form.Group>
                        <Form.Group as={Col} xl={'auto'} sm={'auto'} className='mb-1'>
                            <Form.Label className='mb-0 fw-bold'>Valor</Form.Label>
                            <Form.Label className='mb-0 fs--1 d-block'>R$ {formData[`valor_${formatTovar(e)}_${s.value}`] ? 
                                Number(formData[`valor_${formatTovar(e)}_${s.value}`]).toLocaleString('pt-BR', {minimumFractionDigits:2})
                                : ''}
                            </Form.Label>
                        </Form.Group>
                    </Row>
                )}
                {newetapas.filter(e => e.s === s.value).map((e, index) =>
                    <Row key={index}>
                        <Form.Group as={Col} xl={7} sm={7} className='mb-1'>
                            <Form.Label className='mb-0 fw-bold'>Percentual {e.e}</Form.Label>
                            <Form.Control
                                type='number'
                                value={formData[`percentual_${formatTovar(e.e)}_${s.value}`] || ''}
                                onChange={(e) => handleFieldChange(e, s.value)}
                                name={`percentual_${formatTovar(e.e)}_${s.value}`}
                            />
                        </Form.Group>
                        <Form.Group as={Col} xl={'auto'} sm={'auto'} className='mb-1'>
                            <Form.Label className='mb-0 fw-bold'>Valor</Form.Label>
                            <Form.Label className='mb-0 fs--1 d-block'>R$ {formData[`valor_${formatTovar(e.e)}_${s.value}`] ? 
                                Number(formData[`valor_${formatTovar(e.e)}_${s.value}`]).toLocaleString('pt-BR', {minimumFractionDigits:2})
                                : ''}
                            </Form.Label>
                        </Form.Group>
                        <Col className='pt-3 ps-0'>
                            <FontAwesomeIcon icon={faX} className='text-danger fs-0 cursor-pointer mt-2'  
                                onClick={() => {
                                    setNewEtapas(newetapas.filter(item => !(item.e === e.e && item.s === e.s)))
                                    setListData(listdata.map(l => l.servico === s.value
                                        ? { ...l, dados: l.dados.map(d => d.etapa === e.e ? { ...d, percentual:'', valor:''} : d) }
                                        : l)
                                    );
                                }}
                            />
                        </Col>
                    </Row>
                )}
                <FormCreateEtapa servico={s.id} submit={(d) => {setNewEtapas([...newetapas, {e:d, s:s.value}]);}}/>
            </div>
        )
    );
};

export default ServicoEtapa;


