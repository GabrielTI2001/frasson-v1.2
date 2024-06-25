export const fetchCreditData = async () => {
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/credit/credit-data`;
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const dataapi = await response.json();
    return dataapi
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
};

export const ApiCedula = async (dadosform, id, type) => {
  const token = localStorage.getItem("token")
  const link = `${process.env.REACT_APP_API_URL}/credit/operacoes-cedulas/${type === 'edit' ?id+'/':''}` 
  const method = type === 'edit' ? 'PUT' : 'POST'
  try {
      const response = await fetch(link, {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: dadosform
      });
      if (response.status === 401){
        localStorage.setItem("login", JSON.stringify(false));
        localStorage.setItem('token', "");
      }
      return response
  } catch (error) {
      console.error('Erro:', error);
  }
};