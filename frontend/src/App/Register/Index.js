import React, {useEffect, useState} from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { faTractor, faPersonDigging, faFlask, faPerson, faContactBook, faWheatAlt, faMoneyBillWheat} from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "../../Main";
import { GetRecord } from "../../helpers/Data";
import { RedirectToLogin } from "../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../components/Custom/Commom";
import Association from "../../components/pages/asscociations/Association";

const IndexCadGerais = () =>{
    const {config: { theme}} = useAppContext();
    const user = JSON.parse(localStorage.getItem("user"))
    const [countRegs, setCountRegs] = useState();
    const navigate = useNavigate()
    useEffect(()=>{
      const buscadados = async () =>{
        const dados = await GetRecord('', 'register/cadastros');
        if (!dados){
          RedirectToLogin(navigate)
        }
        else{
          setCountRegs({'benfeitoria':dados.benfeitorias, 'analisesolo':dados.analises_solo, 'maquinas':dados.maquinas,
            'pessoal':dados.pessoal, 'cartorios':dados.cartorios
          })
        }
      }
      if ((user.permissions && user.permissions.indexOf("ver_cadastros_gerais") === -1) && !user.is_superuser){
        navigate("/error/403")
      }
      if(!countRegs){
        buscadados()
      }
    },[])
    return (
      <>
        <CustomBreadcrumb>
          <span className="breadcrumb-item fw-bold" aria-current="page">Cadastros Gerais</span>    
        </CustomBreadcrumb>
        <Row className="gy-3">
          <Col xl='auto' sm='auto'>
            <Association title='Imóveis Rurais' description={'teste'} to={'/farms/farms'} icon={faWheatAlt}/>
          </Col>
          <Col xl='auto' sm='auto'>
            <Association title='Regimes de Exploração' description={'teste'} to={'/farms/regime'} icon={faMoneyBillWheat}/>
          </Col>
          <Col xl='auto' sm='auto'>
            <Association
              title='Cadastro Pessoal' description={countRegs ? countRegs.pessoal+' Registro(s)' : <Spinner size="sm" />}
              to={'/databases/pessoal'} icon={faPerson}
            />
          </Col>
          <Col xl='auto' sm='auto'>
            <Association
              title='Máquinas e Equipamentos' description={countRegs ? countRegs.maquinas+' Registro(s)' : <Spinner size="sm" />}
              to={'/databases/machinery'} icon={faTractor}
            />
          </Col>
          <Col xl='auto' sm='auto'>
            <Association
              title='Benfeitorias Fazendas' description={countRegs ? countRegs.benfeitoria+' Registro(s)' : <Spinner size="sm" />}
              to={'/databases/farm-assets'} icon={faPersonDigging}
            />
          </Col>
          <Col xl='auto' sm='auto'>
            <Association
              title='Análises de Solo' description={countRegs ? countRegs.analisesolo+' Registro(s)' : <Spinner size="sm" />}
              to={'/databases/analysis/soil'} icon={faFlask}
            />
          </Col>
          <Col xl='auto' sm='auto'>
            <Association
              title='Cartórios' description={countRegs ? countRegs.cartorios+' Registro(s)' : <Spinner size="sm" />}
              to={'/databases/cartorios'} icon={faContactBook}
            />
          </Col>
        </Row>
      </>
    )
}

export default IndexCadGerais;