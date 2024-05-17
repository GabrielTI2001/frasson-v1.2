export const HandleSearch = async (search, urlapi, setResults, adicional='') => {
    const token = localStorage.getItem("token")
    const params = search === '' ? '' : `?&search=${search}`
    const url = `${process.env.REACT_APP_API_URL}/${urlapi}/${adicional !== '' ? adicional : ''}${params}`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();
        if (response.status === 401) {
            localStorage.setItem("login", JSON.stringify(false));
            localStorage.setItem('token', "");
        } else if (response.status === 200) {
            setResults(data)
        }
        return response.status
    } catch (error) {
        console.error('Erro:', error);
    }
  };

export const RetrieveRecord = async (uuid, url, setter) => {
    const token = localStorage.getItem("token")
    try{
        const response = await fetch(`${process.env.REACT_APP_API_URL}/${url}/${uuid}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (response.status === 200){
            const data = await response.json();
            setter(data)
        }
        else if (response.status === 401){
            localStorage.setItem("login", JSON.stringify(false));
            localStorage.setItem('token', "");
        }
        return response.status
    } catch (error){
        console.error("Erro: ",error)
    }
}

export const SelectSearchOptions = async (inputValue, link, field) => {
    const token = localStorage.getItem("token")
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/${link}/?search=${inputValue}`;
      const response = await fetch(apiUrl,{
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
      });
  
      const dataapi = await response.json();
      if (response.status === 200){
        const options = dataapi.length > 0 ? dataapi.map(b =>({
            value: b.id,
            label: b[field]
        })) : []
        return options
      }
      else if (response.status === 401){
        localStorage.setItem("login", JSON.stringify(false));
        localStorage.setItem('token', "");
        return 401;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return [];
    }
};

export const SelectOptions = async (link, field) => {
    const token = localStorage.getItem("token")
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/${link}/`;
      const response = await fetch(apiUrl,{
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
      });
  
      const dataapi = await response.json();
      if (response.status === 200){
        const options = dataapi.length > 0 ? dataapi.map(b =>({
            value: b.id,
            label: b[field]
        })) : []
        return options
      }
      else if (response.status === 401){
        localStorage.setItem("login", JSON.stringify(false));
        localStorage.setItem('token', "");
        return 401;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return [];
    }
};