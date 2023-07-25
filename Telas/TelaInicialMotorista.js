import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getDatabase, ref, get, child, set, remove, push } from 'firebase/database';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

const TelaInicialMotorista = ({ navigation }) => {
  const [FormaPagamento, setFormaPagamento] = useState('');
  const [Inicio, setInicio] = useState('');
  const [Fim, setFim] = useState('');
  const [Motorista, setMotorista] = useState('');
  const [NomeUsu, setNomeUsu] = useState('');
  const [NomeUsuTxt, setNomeUsuTxt] = useState('');

  const [TelefoneUsu, setTelefoneUsu] = useState('');
  const [ChaveUnica, setChaveUnica] = useState('');
  const [MotoristaNovo,setMotoristaNovo, onChangeMotoristaNovo] = useState('');
  const [Valor, setValor] = useState('');
  const [ValorTxt, setValorTxt] = useState('');



  const [disponivel, setDisponivel] = useState('INDISPONIVEL');
  const [disponivelCor, setDisponivelCor] = useState('#228B22');

  const route = useRoute();
  const { Login } = route.params;
  let replaceEmail = Login.replace(/@/g, '-');
  replaceEmail = replaceEmail.replace(/\./g, '-');

 // TRATA A QUESTÃO DE RECUSA DE CORRIDA REALOCANDO O MOTORISTA NA LISTA DE DISPONIVEIS

 const realtime = (MotoristaNovo) => {
  const db = getDatabase();
  const corridasRef = ref(db, 'Corridas');

  // Gerar um novo ID único usando push()
  const novaCorridaRef = push(corridasRef);
  const idCorrida = novaCorridaRef.key;
  globalIdCorrida = idCorrida;

  if (Motorista === '') {
    Alert.alert('Sem motoristas disponíveis', 'Não temos motoristas diponivel no momento, tente novamente em instantes');
    return;
  }

  set(ref(db, '/corridas/' + MotoristaNovo + '/'), {
    IdCorrida: idCorrida,
    NomeUsu: NomeUsu,
    Inicio: Inicio,
    Fim: Fim,
    Valor: Valor,
    Telefone: TelefoneUsu,
    FormaPagamento: 'DINHEIRO',
    Motorista: MotoristaNovo,
    ChaveUnica: ChaveUnica
  })
    .then(() => {

    })
    .catch((error) => {
      console.error(error);
    });
};

 const realtimeConsultaDisp = () => {
  const dbRef = ref(getDatabase());
  get(child(dbRef, '/disp')).then((snapshot) => {
    if (snapshot.exists()) {
      const dispData = snapshot.val();
      const dispKeys = Object.keys(dispData);
      const lastDispKey = dispKeys[dispKeys.length - 1];
      const indexLastDisp = dispKeys.indexOf(lastDispKey);

      if (indexLastDisp > 0) {
        const prevDispKey = dispKeys[indexLastDisp - 1];
        const prevDisp = dispData[prevDispKey];
        const moto = prevDisp.NomeUsu;
        let replaceNomeNovo = moto.replace(/@/g, '-').replace(/\./g, '-');
        
        setMotoristaNovo(replaceNomeNovo);
        if (replaceNomeNovo != ''){
          realtime(replaceNomeNovo)
        }
        else{
          const lastDisp = dispData[lastDispKey];
        const moto = lastDisp.NomeUsu;
        let replaceNomeNovo = moto.replace(/@/g, '-').replace(/\./g, '-');
        setMotoristaNovo(replaceNomeNovo);
        }
        console.log('Novo motorista atualizado: ' + replaceNomeNovo);
      } else {
        console.log('Não há registros anteriores ao último motorista disponível.');
      }
    } else {
      console.log('Dados não disponíveis.');
    }
  })
  .catch((error) => {
    console.error(error);
  });
};


const updateMotorista = () => {
  const dbRef = ref(getDatabase());
  const motoristaRef = child(dbRef, '/corridas/' + replaceEmail + '/');

  get(motoristaRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const motoristaData = snapshot.val();

        // Verifique se o objeto motoristaData não é nulo antes de prosseguir
        if (motoristaData) {
          // Remover o registro com o nome antigo (replaceEmail)
          remove(motoristaRef)
            .then(() => {
              console.log('Registro do motorista antigo removido com sucesso!');
            })
            .catch((error) => {
              console.error('Erro ao remover o registro do motorista antigo:', error);
            });

  
        } else {
          console.log('Registro do motorista não encontrado ou é nulo.');
        }
      } else {
        console.log('Registro do motorista não encontrado.');
      }
    })
    .catch((error) => {
      console.error('Erro ao consultar o registro do motorista:', error);
    });
};


  
  const AtualizaCorrida = () => {
    realtimeConsultaDisp();
    updateMotorista()
  }

 // FIM DA RECUSA
// 

  const realtimeConsulta = () => {
    const dbRef = ref(getDatabase());
    get(child(dbRef,'/corridas/'+replaceEmail+'/')).then((snapshot) => {
      if (snapshot.exists()) {
        const FormaPagamento = snapshot.val().FormaPagamento;
        const Inicio = snapshot.val().Inicio;
        const Fim = snapshot.val().Fim;
        const Motorista = snapshot.val().Motorista;
        const Valor = snapshot.val().Valor;
        const NomeUsu = snapshot.val().NomeUsu;
        const TelefoneUsu = snapshot.val().TelefoneUsu;
        const ChaveUnica = snapshot.val().ChaveUnica;

        setFormaPagamento(FormaPagamento);
        setNomeUsu(NomeUsu);
        setInicio(Inicio);
        setFim(Fim);
        setMotorista(Motorista);
        setValor(Valor);
        setValorTxt('R$: '+Valor);

        setChaveUnica(ChaveUnica)
        setNomeUsuTxt('A CHAVE DE SEGURANÇA DE ' + NomeUsu.toUpperCase()+' É: '+ChaveUnica);


      } else {
        setFormaPagamento('');
        setNomeUsu('');
        setNomeUsuTxt('Aguardando Corrida...');
        setInicio('');
        setChaveUnica('');
        setFim('');
        setMotorista('');
        setValorTxt('');
      }
    }).catch((error) => {
      console.error(error);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      realtimeConsulta();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const InsereDisp = () => {
    const db = getDatabase();
    const corridasRef = ref(db, 'disp');
    const novoStatus = disponivel === 'DISPONIVEL' ? 'INDISPONIVEL' : 'DISPONIVEL';
  
    if (disponivel === 'DISPONIVEL') {
      // Remover o registro do Realtime Database
      const registroRef = ref(db, '/disp/' + replaceEmail);
      remove(registroRef)
        .then(() => {
          console.log('Registro removido com sucesso.');
          setDisponivel(novoStatus);
        })
        .catch((error) => {
          console.error('Erro ao remover o registro:', error);
        });
    } else if (disponivel === 'INDISPONIVEL') {
      set(ref(db, '/disp/' + replaceEmail + '/'), {
        NomeUsu: Login,
      })
        .then(() => {
          setDisponivel(novoStatus);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  
  

  useEffect(() => {
    setDisponivelCor(disponivel === 'DISPONIVEL' ? '#228B22' : '#FF0000');
  }, [disponivel]);

  return (
    <View style={styles.visualiza}>
      {/* <Text style={styles.corr}>{FormaPagamento}</Text> */}
      <Text style={styles.corr}>{NomeUsuTxt}</Text>
      <Text style={styles.corr}>{Inicio}</Text>
      <Text style={styles.corr}>{Fim}</Text>
      <Text style={styles.corr}>{ValorTxt} </Text>
      

      <View style={styles.btns}>
      <TouchableOpacity style={styles.aceitar}>
          <Image style={styles.iconImg} source={require('../Material/confirme.png')}/>
      </TouchableOpacity>
      <TouchableOpacity style={styles.recusar} onPress={AtualizaCorrida}>
        <Image style={styles.iconImg} source={require('../Material/rejeitado.png')}/>
      </TouchableOpacity>
      </View>
      <View style={[styles.Disp, { backgroundColor: disponivelCor }]}>
        <TouchableOpacity style={styles.tchdisp} onPress={InsereDisp}>
          <Text style={styles.textDisp}>{disponivel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  visualiza: {
    flex: 1,
    justifyContent: 'center',
    left: 10,
  },
  Disp: {
    width: '95%',
    flex: 1,
    justifyContent: 'center',
    position: 'absolute',
    bottom: 100,
    borderRadius: 50,
  },
  textDisp: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  tchdisp: {},

  iconImg:{
    width: 80,
    height: 80,
    marginRight: 40,
    top: 50,
  },
 
  btns:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    justifyContent: 'center',
  
  },
  corr:{
    fontSize: 18,
  }
});

export default TelaInicialMotorista;
