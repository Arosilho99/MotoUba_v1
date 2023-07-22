import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getDatabase, ref, get, child, push, set, remove } from 'firebase/database';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

const TelaInicialMotorista = ({ navigation }) => {
  const [FormaPagamento, setFormaPagamento] = useState('');
  const [Inicio, setInicio] = useState('');
  const [Fim, setFim] = useState('');
  const [Motorista, setMotorista] = useState('');
  const [MotoristaNovo,setMotoristaNovo, onChangeMotoristaNovo] = useState('');

  
  const [Valor, setValor] = useState('');


  const [disponivel, setDisponivel] = useState('INDISPONIVEL');
  const [disponivelCor, setDisponivelCor] = useState('#228B22');

  const route = useRoute();
  const { Login } = route.params;
  let replaceEmail = Login.replace(/@/g, '-');
  replaceEmail = replaceEmail.replace(/\./g, '-');

 // TRATA A QUESTÃO DE RECUSA DE CORRIDA REALOCANDO O MOTORISTA NA LISTA DE DISPONIVEIS

const realtimeConsultaDisp = () => {
  const dbRef = ref(getDatabase());
  get(child(dbRef, '/disp')).then((snapshot) => {
      if (snapshot.exists()) {
        const dispData = snapshot.val();
        const dispKeys = Object.keys(dispData);
        const lastDispKey = dispKeys[dispKeys.length - 1];
        const lastDisp = dispData[lastDispKey];
        const moto = lastDisp.NomeUsu;
        let replaceNome = moto.replace(/@/g, '-').replace(/\./g, '-');

        // Realoca o motorista na lista de disponíveis com o novo nome
        set(ref(dbRef, '/disp/'+replaceNome+'/'), {
          NomeUsu: Login, // Substitua Login pelo valor correto do nome do motorista
        });

        // Chama a função para atualizar o motorista no registro de corridas
        setMotoristaNovo(replaceNome);
        console.log(MotoristaNovo);

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

          // Defina os novos dados do motorista com o novo nome (MotoristaNovo)
          const motoristaNovoRef = child(dbRef, '/corridas/' + MotoristaNovo + '/');
          set(motoristaNovoRef, {
            ...motoristaData, // Mantenha as informações atuais
            Motorista: MotoristaNovo, // Atualize o nome do motorista para 'MotoristaNovo' ou qualquer outro valor desejado
          })
          .then(() => {
            console.log('Motorista atualizado com o novo nome com sucesso!');
            setMotorista('MotoristaNovo'); // Atualize o estado local também, se necessário
          })
          .catch((error) => {
            console.error('Erro ao atualizar o motorista com o novo nome:', error);
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

        setFormaPagamento(FormaPagamento);
        setInicio(Inicio);
        setFim(Fim);
        setMotorista(Motorista);
        setValor(Valor);

      } else {
        console.log('No data available');
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
      <Text style={styles.corr}>{Inicio}</Text>
      <Text style={styles.corr}>{Fim}</Text>
      <Text style={styles.corr}>R${Valor}</Text>
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
