import classNames from 'classnames';
import AsyncSelect from 'react-select/async';
import React, { useEffect, useRef, useState, useContext } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { SelectSearchOptions } from '../../../helpers/Data';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import api from '../../../context/data';
import { PipeContext } from '../../../context/Context';
import { toast } from 'react-toastify';

const ProductForm = ({
  onSubmit,
  type,
  fase
}) => {
  const {config: {theme}} = useAppContext();
  const { kanbanDispatch } = useContext(PipeContext);
  const [formData, setFormData] = useState({phase:fase, id:4});
  const [message, setMessage] = useState();
  const inputRef = useRef(null);
  const token = localStorage.getItem("token")

  const submit = async () => {
      const isEmpty = !Object.keys(formData).length;
    if (!isEmpty) {
      api.post('pipeline/cards/produtos/', formData, {headers: {Authorization: `bearer ${token}`}})
      .then((response) => {
        kanbanDispatch({
          type: 'ADD_TASK_CARD',
          payload: { targetListId: fase, 
            novocard:{id: response.data.id, card:response.data.card, str_detalhamento:response.data.info_detalhamento.detalhamento_servico,
            str_beneficiario:response.data.list_beneficiario[0].razao_social, created_at: response.data.created_at, code:response.data.code,
            prioridade:response.data.prioridade
          }}
        });
        onSubmit()
        toast.success("Card adicionado com sucesso!")
      })
      .catch((erro) => {
        if(erro.response.status == 400){
          setMessage(erro.response.data)
        }
        console.error('erro: '+erro);
      })
    }
  };

  return (
    <>
      <div
        className={classNames('rounded-3 transition-none', {
          'bg-100 p-x1': type === 'list',
          'p-3 border bg-white dark__bg-1000 mt-3': type === 'card'
        })}
      >
        <Form className='row'
          onSubmit={e => {
            e.preventDefault();
            return submit();
          }}
        >
          <Form.Group className="mb-2" as={Col} lg={4} xl={3} sm={6}>
            <Form.Label className='fw-bold mb-1'>Card*</Form.Label>
            <Form.Select
              ref={inputRef}
              onChange={({ target }) =>
                setFormData({ ...formData, card: target.value })
              }
            >
              <option>---</option>
              <option value='Principal'>Principal</option>
              <option value='Paralelo'>Paralelo</option>
              <option value='Ocorrência'>Ocorrência</option>
            </Form.Select>  
            <label className='text-danger fs--2'>{message ? message.card : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={4} xl={3} sm={6}>
            <Form.Label className='fw-bold mb-1'>Prioridade</Form.Label>
            <Form.Select
              ref={inputRef}
              onChange={({ target }) =>
                setFormData({ ...formData, prioridade: target.value })
              }
            >
              <option>---</option>
              <option value='Alta'>Alta</option>
              <option value='Media'>Média</option>
              <option value='Baixa'>Baixa</option>
            </Form.Select>  
            <label className='text-danger fs--2'>{message ? message.prioridade : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={5}>
            <Form.Label className='fw-bold mb-1'>Beneficiário*</Form.Label>
            <AsyncSelect 
              ref={inputRef} isMulti styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(v) => SelectSearchOptions(v, 'pipeline/beneficiarios', 'razao_social', 'cpf_cnpj')}
              onChange={(selectedOptions ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  beneficiario: selectedOptions.map(s => s.value)
                }));
              }} 
              className='mb-1'
            />
            <label className='text-danger fs--2'>{message ? message.beneficiario : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={5}>
            <Form.Label className='fw-bold mb-1'>Responsáveis*</Form.Label>
            <AsyncSelect 
              ref={inputRef} isMulti styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(v) => SelectSearchOptions(v, 'users/users', 'first_name', 'last_name', true)}
              onChange={(selectedOptions ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  responsaveis: selectedOptions.map(s => s.value)
                }));
              }} 
              className='mb-1'
            />
            <label className='text-danger fs--2'>{message ? message.beneficiario : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={4}>
            <Form.Label className='fw-bold mb-1'>Detalhamento da Demanda*</Form.Label>
            <AsyncSelect 
              ref={inputRef}  styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(v) => SelectSearchOptions(v, 'pipeline/detalhamentos', 'detalhamento_servico')}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  detalhamento: selected.value
                }));
              }} 
              className='mb-1'
            />
            <label className='text-danger fs--2'>{message ? message.detalhamento : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={4} xl={3} sm={6}>
            <Form.Label className='fw-bold mb-1'>Valor da Operação</Form.Label>
            <Form.Control
              type='number'
              ref={inputRef}
              onChange={({ target }) =>
                setFormData({ ...formData, valor_operacao: target.value })
              }
              value={formData.valor_operacao || ''}
            />
            <label className='text-danger fs--2'>{message ? message.valor_operacao : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={4}>
            <Form.Label className='fw-bold mb-1'>Instituição Vinculada*</Form.Label>
            <AsyncSelect
              ref={inputRef}  styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(v) => SelectSearchOptions(v, 'pipeline/instituicoes', 'razao_social', 'identificacao')}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  instituicao: selected.value
                }));
              }} 
              className='mb-1'
            />
            <label className='text-danger fs--2'>{message ? message.instituicao : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} xl={4}>
            <Form.Label className='fw-bold mb-1'>Contrato Vinculado*</Form.Label>
            <AsyncSelect
              ref={inputRef}  styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              loadOptions={(v) => SelectSearchOptions(v, 'pipeline/contratos', 'contratante', 'produto')}
              onChange={(selected ) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  contrato: selected.value
                }));
              }} 
              className='mb-1'
            />
            <label className='text-danger fs--2'>{message ? message.contrato : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={4} xl={3} sm={6}>
            <Form.Label className='fw-bold mb-1'>Data Vencimento</Form.Label>
            <Form.Control
              type='date'
              ref={inputRef}
              onChange={({ target }) =>
                setFormData({ ...formData, data_vencimento: target.value })
              }
              value={formData.data_vencimento || ''}
            />
            <label className='text-danger fs--2'>{message ? message.data_vencimento : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2 text-end" as={Col} xl={12}>
            <Button
              variant="primary"
              size="sm"
              className="col-2 fs-xs"
              type="submit"
            >
              <span>Adicionar</span>
          </Button>
          </Form.Group>

          <Row className="gx-2 w-50 ms-2">
          </Row>  
        </Form>
      </div>   
    </>
  );
};

export default ProductForm;
