interface LocationBusiness {
    endereco: string;
    endereco_n: string;
    pais: string;
    cidadeBr?: {
        loc_no: string;
        ufe_sg: string;
    };
    cidadeUi?: {
        nome: string;
    };
    estadoUi?: {
        nome: string;
    };
}

export const renderTextLocation = (empresa?: LocationBusiness | null) => {
    if ( !empresa ) {
        return '';
    }

    let locationText = empresa.endereco + ', ' + empresa.endereco_n;

    if (empresa.pais === 'Brasil' && empresa.cidadeBr) {
        locationText += ', ' + empresa.cidadeBr.loc_no + ' - ' + empresa.cidadeBr.ufe_sg;
    } else if (empresa.pais === 'Uruguai' && empresa.cidadeUi && empresa.estadoUi) {
        locationText += ', ' + empresa.cidadeUi.nome + ' - ' + empresa.estadoUi.nome;
    }

    return locationText;
};