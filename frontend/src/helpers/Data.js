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