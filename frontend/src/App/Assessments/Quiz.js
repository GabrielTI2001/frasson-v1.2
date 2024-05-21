import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Form, Row, Col, Button } from "react-bootstrap";

const Quiz = () =>{
    const [message, setMessage] = useState()
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [dados, setDados] = useState()
    const [formData, setFormData] = useState()
    const [index, setIndex] = useState(0)
    const {uuid} = useParams()
    console.log(dados)


    const sendData = async (form) => {
        const link = `${process.env.REACT_APP_API_URL}/assessments/quiz/${uuid}?user=${user.id}`
        try {
            const response = await fetch(link, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`
              },
              body:form
            });
            const data = await response.json();
            if (response.status === 401){
              localStorage.setItem("login", JSON.stringify(false));
              localStorage.setItem('token', "");
              navigate("/auth/login");
            }
            else if (response.status === 201 || response.status === 200){
              setDados(data.questions)
            }
            else if (response.status === 400){
                setMessage(data.fields_error)
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };
    const handleSubmit = (e, avaliadoid) => {
        console.log(dados.filter(d => d.avaliado.id !== avaliadoid))
        setMessage(null)
        e.preventDefault();
        const formDataToSend = new FormData();
        for (const key in formData) {
          formDataToSend.append(key, formData[key]);
        } 
        formDataToSend.append(`av${avaliadoid}`, avaliadoid);
        sendData(formDataToSend)
    };

    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
    };

    const getData = async () => {
        const link = `${process.env.REACT_APP_API_URL}/assessments/quiz/${uuid}?user=${user.id}`
        try {
            const response = await fetch(link, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${token}`
              },
            });
            const data = await response.json();
            if (response.status === 401){
              localStorage.setItem("login", JSON.stringify(false));
              localStorage.setItem('token', "");
              navigate("/auth/login");
            }
            else if (response.status === 201 || response.status === 200){
              setDados(data.questions)
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };
    useEffect(()=>{
        getData()
    },[])

    return (
        <>
            <ol className="breadcrumb breadcrumb-alt mb-2">
                <li className="breadcrumb-item fw-bold">
                    <Link className="link-fx text-primary" to={'/assessments/my'}>Minhas Avaliações</Link>
                </li>
                <li className="breadcrumb-item fw-bold" aria-current="page">
                    Questionário
                </li>             
            </ol>
            {dados && (dados.length > 0 ?
            <>
                <div id="header-quiz" className="row-12 justify-content-start align-items-center position-fixed sectionform"
                style={{marginTop: '-0.6rem'}}>
                    <span className="col-auto col-auto l-0">Colaborador Avaliado: </span>
                    <img className="rounded-circle p-1" src={`${process.env.REACT_APP_API_URL}/media/${dados[index].avaliado.avatar}`} 
                        alt="Header Avatar" style={{width: '35px'}}
                    />
                    <span className="col-xl-auto col-lg-auto fw-bold ps-1">{dados[index].avaliado.nome_completo}</span>
                </div>
                <Form onSubmit={(e) => handleSubmit(e, dados[index].avaliado.id)} className='mt-5 sectionform'>
                    {dados[index].questionsq.map( quantitative =>
                        <Form.Group className="mb-3 container-fluid" as={Row} key={quantitative.id} xl={12}>
                            <Form.Label className='row fw-bold mb-1'>{quantitative.category}</Form.Label>
                            <Form.Label className='row fw-bold'>{quantitative.pergunta}</Form.Label>
                            {quantitative.choices.map(choice =>
                                <Form.Check 
                                    className="col-auto me-1 mb-0 cursor-pointer"
                                    key={choice[0]}
                                    name={quantitative.id}
                                    type="radio"
                                    label={choice[1]}
                                    value={choice[0]}
                                    onChange={handleFieldChange}
                                    id={`inline-${quantitative.id}-${choice[0]}`}
                                />
                            )}
                            <span className="text-danger px-0">{message ? message[quantitative.id] : ''}</span>
                        </Form.Group>

                    )}
                    {dados[index].questionsn.map( qualitative =>
                        <Form.Group className="mb-2 container-fluid" as={Row} key={qualitative.id} xl={12}>
                            <Form.Label className='row fw-bold mb-1'>{qualitative.category}</Form.Label>
                            <Form.Label className='row fw-bold mb-1'>{qualitative.pergunta}</Form.Label>
                            {qualitative.choices.map(choice =>
                                <Form.Check 
                                    className="col-auto me-3 cursor-pointer"
                                    key={choice[0]}
                                    name={qualitative.id}
                                    type="radio"
                                    label={choice[1]}
                                    value={choice[0]}
                                    onChange={handleFieldChange}
                                    id={`inline-${qualitative.id}-${choice[0]}`}
                                />
                            )}
                            <span className="text-danger px-0">{message ? message[qualitative.id] : ''}</span>
                        </Form.Group>
                    )}
                    <Form.Group className="ps-0">
                        <Button type="submit">Avaliar {dados[index].avaliado.nome}</Button>
                    </Form.Group>
                </Form>
            </>
            : <h3>Formulário Finalizado!</h3>)}

        </>
    )
}

export default Quiz;