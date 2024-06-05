def calcmedia(lista, attrib):
    agregado = 0
    for l in lista:
        agregado+= l[attrib]
    media = agregado/len(lista) if len(lista) > 0 else 0
    return media