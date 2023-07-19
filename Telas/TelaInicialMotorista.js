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
  const [Valor, setValor] = useState('');


  const [disponivel, setDisponivel] = useState('INDISPONIVEL');
  const [disponivelCor, setDisponivelCor] = useState('#228B22');

  const route = useRoute();
  const { Login } = route.params;
  let replaceEmail = Login.replace(/@/g, '-');
  replaceEmail = replaceEmail.replace(/\./g, '-');

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
      <Text>{FormaPagamento}</Text>
      <Text>{Inicio}</Text>
      <Text>{Fim}</Text>
      <Text>R${Valor}</Text>
      <View style={styles.btns}>
      <TouchableOpacity style={styles.aceitar}>
          <Image style={styles.iconImg} source={require('../Material/confirme.png')}/>
      </TouchableOpacity>
      <TouchableOpacity style={styles.recusar}>
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
    marginRight: 50,
  },
 
  btns:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    justifyContent: 'center',
  
  },
});

export default TelaInicialMotorista;
