import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getDatabase, ref, get, child, set, remove, push, runTransaction } from 'firebase/database';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { format } from 'date-fns';
import Modal from 'react-native-modal';
import * as Location from 'expo-location'; // Importar o módulo de localização do Expo

import { Linking } from 'react-native';



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

  const [isModalVisibleAceitou, setModalVisibleAceitou] = useState(false);
  const [isModalVisibleCorridas, setModalVisibleCorridas] = useState(true);
  const [showFinishButton, setShowFinishButton] = useState(false);



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

      if (dispKeys.length > 0) {
        const randomIndex = Math.floor(Math.random() * dispKeys.length);
        const randomDispKey = dispKeys[randomIndex];
        const randomDisp = dispData[randomDispKey];
        const moto = randomDisp.NomeUsu;
        let replaceNomeNovo = moto.replace(/@/g, '-').replace(/\./g, '-');
        
        setMotoristaNovo(replaceNomeNovo);
        if (replaceNomeNovo !== '') {
          realtime(replaceNomeNovo);
        } else {
          console.log('Nome do próximo motorista está vazio.');
        }
        console.log('Novo motorista atualizado: ' + replaceNomeNovo);

        // Remove the selected driver from the list to ensure only one is chosen
        updateDisp(child(dbRef, '/disp/' + randomDispKey))
          .then(() => {
            console.log('Registro do motorista removido da lista de disponíveis.');
          })
          .catch((error) => {
            console.error('Erro ao remover o registro do motorista:', error);
          });
      } else {
        console.log('Não há registros de motoristas disponíveis.');
      }
    } else {
      console.log('Dados não disponíveis.');
    }
  }).catch((error) => {
    console.error(error);
  });
};



const updateMotorista = () => {
  const dbRef = ref(getDatabase());
  const motoristaRef = child(dbRef, '/corridas/' + replaceEmail + '/');

  // Primeiro, vamos obter a lista de motoristas
  get(motoristaRef.parent)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const corridasData = snapshot.val();
        const numMotoristas = corridasData ? Object.keys(corridasData).length : 0;

        // Verifique se há mais de um motorista antes de prosseguir com a exclusão
        if (numMotoristas > 1) { // Verifica se há mais de um motorista disponível
          remove(motoristaRef)
            .then(() => {
              console.log('Registro do motorista antigo removido com sucesso!');
            })
            .catch((error) => {
              console.error('Erro ao remover o registro do motorista antigo:', error);
            });
        } else {
          // Não é possível excluir o registro do motorista. Não há outros motoristas disponíveis.
          console.log('A corrida não pode ser cancelada porque você é o único motorista disponível.');
          Alert.alert(
            'Não é possível cancelar a corrida',
            'Você é o único motorista disponível. A corrida não pode ser cancelada no momento.',
          );
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
      const registroRef = ref(db, `/disp/${replaceEmail}`);
      remove(registroRef)
        .then(() => {
          console.log('Registro removido com sucesso.');
          setDisponivel(novoStatus);
        })
        .catch((error) => {
          console.error('Erro ao remover o registro:', error);
        });
    } else if (disponivel === 'INDISPONIVEL') {
      const novoRegistroRef = ref(db, '/disp/' + replaceEmail);
  
      // Usar uma transação para garantir a ordem de inserção
      runTransaction(novoRegistroRef, (currentData) => {
        if (!currentData) {
          return { NomeUsu: Login };
        }
        // Se o registro já existe, retornar currentData para não modificar o registro existente
        return currentData;
      })
        .then(() => {
          setDisponivel(novoStatus);
          console.log('Registro adicionado com sucesso.');
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  
  const VerificaRegistroEAtualizaStatus = () => {
    const db = getDatabase();
    const registroRef = ref(db, `/disp/${replaceEmail}`);
  
    get(registroRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const registro = snapshot.val();
          if (registro.disponivel !== 'DISPONIVEL') {
            // Atualiza o status para DISPONIVEL
            registro.disponivel = 'DISPONIVEL';
  
            // Usa uma transação para atualizar o status
            runTransaction(registroRef, () => registro)
              .then(() => {
                console.log('Status atualizado para DISPONIVEL.');
                setDisponivel('DISPONIVEL');
              })
              .catch((error) => {
                console.error('Erro ao atualizar o status:', error);
              });
          } else {
            setDisponivel('DISPONIVEL'); // Já está disponível, define o estado na tela
          }
        } else {
          setDisponivel('INDISPONIVEL'); // Não encontrado, define o estado na tela
        }
      })
      .catch((error) => {
        console.error('Erro ao verificar o registro:', error);
      });
  };
  

  useEffect(() => {
    setDisponivelCor(disponivel === 'DISPONIVEL' ? '#228B22' : '#FF0000');
    VerificaRegistroEAtualizaStatus()
  }, [disponivel]);

  const AceitarCorrida = () => {
    const db = getDatabase();
    const dataHoraAtual = format(new Date(), 'yyyyMMdd_HHmmss');
  
    // Salvar as informações da corrida aceita na tabela "corridas aceitas"
    const corridasAceitasRef = ref(db, `corridasAceitas/${replaceEmail}_${dataHoraAtual}`);
    const motoristaRef = ref(db, `/disp/${replaceEmail}`); // Referência para o registro do motorista
  
    // Usa push para adicionar um novo item na tabela
    push(corridasAceitasRef, { NomeUsu: NomeUsu, FormaPagamento: FormaPagamento, Inicio: Inicio, Fim: Fim, Valor: Valor })
      .then(() => {
        console.log('Corrida aceita salva com sucesso.');
  
        // Remover o registro do motorista
        remove(motoristaRef)
          .then(() => {
            console.log('Registro do motorista removido com sucesso.');
            setDisponivel('INDISPONIVEL'); // Atualiza o estado na tela
            setModalVisibleCorridas(false);
            setModalVisibleAceitou(true);
            setupFinishButtonTimeout();

          })
          .catch((error) => {
            console.error('Erro ao remover o registro do motorista:', error);
          });
      })
      .catch((error) => {
        console.error('Erro ao salvar corrida aceita:', error);
      });
  };
  const AbrirGoogleMapsApp = async (parada1, parada2) => {
    try {
      const { coords } = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = coords;
  
      const partidaFormatada = `${latitude},${longitude}`;
      const parada1Formatada = encodeURIComponent(parada1);
      const parada2Formatada = encodeURIComponent(parada2);
  
      const url = `https://www.google.com/maps/dir/?api=1&origin=${partidaFormatada}&destination=${parada2Formatada}&waypoints=${parada1Formatada}`;
  
      Linking.openURL(url)
        .catch((error) => {
          console.error('Erro ao abrir o aplicativo Google Maps:', error);
        });
    } catch (error) {
      console.error('Erro ao obter a localização do usuário:', error);
    }
  };
  const cancelarCorrida = () => {
    const dbRef = ref(getDatabase());
    const corridaRef = child(dbRef, `/corridas/${replaceEmail}`);
  
    get(corridaRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const corridaData = snapshot.val();
  
          // Remover o registro da corrida
          remove(corridaRef)
            .then(() => {
              console.log('Registro da corrida removido com sucesso.');
              InsereDisp();
              setModalVisibleCorridas(true);
              setModalVisibleAceitou(false);
            })
            .catch((error) => {
              console.error('Erro ao remover o registro da corrida:', error);
            });
        } else {
          console.log('Registro da corrida não encontrado.');
        }
      })
      .catch((error) => {
        console.error('Erro ao consultar o registro da corrida:', error);
      });
  };
  const setupFinishButtonTimeout = () => {
    const timeout = setTimeout(() => {
      setShowFinishButton(true);
    }, 300000); // 5 minutos em milissegundos
  
    setFinishButtonTimeout(timeout);
  };
  

  return (
    <View style={styles.visualiza}>
      <Modal isVisible={isModalVisibleCorridas}style={styles.MDS}>
        <View style={styles.MdCorridas}>
        <View style={styles.MdCorpo}>

          {/* <Text style={styles.corr}>{FormaPagamento}</Text> */}
      <Text style={styles.corr}>{NomeUsuTxt}</Text>
      <Text style={styles.corr}>{Inicio}</Text>
      <Text style={styles.corr}>{Fim}</Text>
      <Text style={styles.corr}>{ValorTxt} </Text>
      </View>
      <View style={styles.btns}>
        {NomeUsu  && (
          <TouchableOpacity style={styles.aceitar} onPress={AceitarCorrida}>
            <Text style={styles.aceitarBtn}>ACEITAR</Text>
          </TouchableOpacity>
        )}
        {NomeUsu  && (
          <TouchableOpacity style={styles.recusar} onPress={AtualizaCorrida}>
            <Text style={styles.rejeitarBtn}>REJEITAR</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.Disp, { backgroundColor: disponivelCor }]}>
        <TouchableOpacity style={styles.tchdisp} onPress={InsereDisp}>
          <Text style={styles.textDisp}>{disponivel}</Text>
        </TouchableOpacity>
      </View> 
      </View>  
    </Modal>

    <Modal isVisible={isModalVisibleAceitou}style={styles.MDS}>
        <View style={styles.MdAceitou}>
          <View style={styles.MdTop}>
          <Text style={styles.corrTitle}>Corrida Aceita</Text>
          </View>
          <View style={styles.MdCorpo}>

          <Text style={styles.corr}>Nome do Cliente: {NomeUsu}</Text>
          <Text style={styles.corr}>Chave unica: {ChaveUnica}</Text>
          <Text style={styles.corr}>Inicio: {Inicio}</Text>
          <Text style={styles.corr}>Fim: {Fim}</Text>
          <Text style={styles.corr}>{ValorTxt}</Text>
          </View>
          <Image style={styles.iconImg} source={require('../Material/corrida.png')}/>
          <TouchableOpacity onPress={() => AbrirGoogleMapsApp(Inicio,Fim)}>
          <Text style={styles.BtnAbrirMapas}>ABRIR MAPA</Text>
        </TouchableOpacity>
        {showFinishButton && (
        <TouchableOpacity onPress={cancelarCorrida}>
          <Text style={styles.BtnAbrirMapas}>FINALIZAR CORRIDA</Text>
        </TouchableOpacity>
      )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  visualiza: {
    flex: 1,
    justifyContent: 'center',
    left: 10,
  },
  MdAceitou: {
    flex: 1,
    justifyContent: 'center',
    left: 10,
  },
  MdCorridas: {
    flex: 1,
    justifyContent: 'center',
    left: 10,
    
  },
  MDS: {
    backgroundColor:'#E6E6FA',
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom:0,

  },
  MdTop:{
    backgroundColor:'#555555',
    justifyContent: 'center',
    width:'95%',
    top: '-25%',
    borderRadius: 10,
    shadowColor: 'black', 
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  
  },
  MdCorpo:{
    backgroundColor:'#555555',
    width: '95%',
    justifyContent: 'center',
    top: '-23%',
    borderRadius: 5,
    shadowColor: 'black', 
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontSize: 22,
    textAlign: 'center',
  },
  tchdisp: {},

  iconImg:{
    width: '96%',
    height: '50%',
    position: 'absolute',
    top: 260,
  },
 
  btns:{
  },
  corr:{
    fontSize: 20,
    textAlign: 'justify',
    color: 'white',

  },
  corrTitle:{
    fontSize: 32,
    textAlign: 'center',
    color: 'white',

  },
  BtnAbrirMapas:{
    backgroundColor:'#DDA0DD',
    borderRadius: 50,
    width: 300,
    textAlign: 'center',
    fontSize: 38,
    color: 'white',
    top: 250,
    width: '100%',
    marginLeft: -10,
    marginTop: 10,

  },
  aceitarBtn:{
    backgroundColor: '#228B22',
    color: 'white',
    fontSize: 30,
    borderRadius: 10,
    width: '100%',
    textAlign: 'center',
    marginBottom: 10,
  },
  rejeitarBtn:{
    backgroundColor: '#FF0000',
    color: 'white',
    fontSize: 30,
    borderRadius: 10,
    width: '100%',
    textAlign: 'center',

  }
});

export default TelaInicialMotorista;
