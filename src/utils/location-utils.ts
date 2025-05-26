export const renderTextLocation = (empresa: any) => {
    if ( !empresa ) {
        return '';
    }

    let locationText = empresa.endereco + ', ' + empresa.endereco_n;

    if (empresa.pais === 'Brasil') {
        locationText += ', ' + empresa.cidadeBr.loc_no + ' - ' + empresa.cidadeBr.ufe_sg;
    } else if (empresa.pais === 'Uruguai') {
        locationText += ', ' + empresa.cidadeUi.nome + ' - ' + empresa.estadoUi.nome;
    }

    return locationText;
};