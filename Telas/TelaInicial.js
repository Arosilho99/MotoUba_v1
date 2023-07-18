import React, { useState, useEffect, useRef } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geocoder from 'react-native-geocoding';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase, ref, set, child, get, push } from "firebase/database";
import { useRoute } from '@react-navigation/native';
import * as Updates from 'expo-updates';
import { Linking } from 'react-native-web';
import { Alert } from 'react-native';




const TelaInicial = ({ navigation }) => {

  const route = useRoute();
  const { Login } = route.params;
  let replaceEmail = Login.replace(/@/g, '-');
  replaceEmail = replaceEmail.replace(/\./g, '-');

  const GOOGLE_MAPS_APIKEY = 'AIzaSyAVT7DjunN8YEDvzBHBdkS_FItM7PzkJqM';
  Geocoder.init('AIzaSyBVwU7W0JHJ25v5PWULYQkO8D6Ro3pbDek');

  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  
  const [origemD, onChangeOrigemD] = useState('');
  const [destinoD, setDestinoD] = useState('');

  const handleDestinationChange = (value) => {
    setDestinoD(value);
  };

  const [refreshKey, setRefreshKey] = useState(1);

  const [mapaVisivel, setMapaVisivel] = useState(false);

  const [result, setResult] = useState(null);

  const [valorCorrida, setValorCorrida] = useState(0);

  const [DistanciaCorrida, setDistanciaCorrida] = useState(0);

  const [CabecalhoAnterior, setCabecalhoAnterior] = useState(true);

  const [isModalVisible, setModalVisible] = useState(false);

  const [isModalVisibleEntrada, setModalVisibleEntrada] = useState(true);

  const [isModalVisibleConfirma, setModalVisibleConfirma] = useState(false);

  const [isModalVisibleAguarda, setModalVisibleAguarda] = useState(false);


  const [data, setData] = useState([]);

  const [NomeUsu, onChangeNomeUsu] = useState('');
  const [Motorista, onChangeMotorista] = useState('');

  let globalIdCorrida = '';


  const [TelefoneUsu, onChangeTelefoneUsu] = useState('');

  const [address, setAddress] = useState('');

  const currentTime = new Date();
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();

const phoneNumber = '+5514999391518';
const whatsappUrl = 'https://api.whatsapp.com/send?phone=5514996391518';


const realtimeConsulta = () => {
  const dbRef = ref(getDatabase());
  get(child(dbRef, '/usuarios')).then((snapshot) => {
    if (snapshot.exists()) {
      const usuarios = snapshot.val();
      const tabelas = Object.keys(usuarios).filter(key => typeof usuarios[key] === 'object');

      tabelas.forEach((tabela) => {
        if (tabela === replaceEmail) {
          get(child(dbRef, '/usuarios/' + replaceEmail+'/')).then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
              const usuarios = snapshot.val();

              const user = childSnapshot.val();
              const NomeUsu = usuarios.NomeUsu; // Obtém o objeto contendo os usuários
              const TelefoneUsu = usuarios.TelefoneUsu; // Obtém o objeto contendo os usuários
        
              onChangeNomeUsu(NomeUsu);
              onChangeTelefoneUsu(TelefoneUsu);
            });
          });
        }
      });
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
};


const realtimeConsultaDisp = () => {
  const dbRef = ref(getDatabase());
  get(child(dbRef, '/disp')).then((snapshot) => {
    if (snapshot.exists()) {
      const dispKeys = Object.keys(snapshot.val());
      const lastDispKey = dispKeys[dispKeys.length - 1];

      const lastDispRef = child(dbRef, `/disp/${lastDispKey}`);
      get(lastDispRef).then((lastDispSnapshot) => {
        const lastDisp = lastDispSnapshot.val();
        const moto = lastDisp.NomeUsu;
        let replaceNome = moto.replace(/@/g, '-');
        replaceNome = replaceNome.replace(/\./g, '-');
         onChangeMotorista(replaceNome);
      }).catch((error) => {
        console.error(error);
      });
    }
  }).catch((error) => {
    console.error(error);
  });
};




const realtime = () => {
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

  set(ref(db, '/corridas/' + Motorista + '/'), {
    IdCorrida: idCorrida,
    NomeUsu: NomeUsu,
    Inicio: address,
    Fim: destinoD,
    Valor: valorCorrida.toFixed(2),
    Telefone: TelefoneUsu,
    FormaPagamento: 'DINHEIRO',
    Motorista: Motorista,
  })
    .then(() => {
      toggleModal();
      setModalVisibleAguarda(true);
      VerificaMotoristaAceitou();
      setModalVisibleAguarda(false);
      setModalVisibleConfirma(true);
    })
    .catch((error) => {
      console.error(error);
    });
};

  const onReady = (result) => {
    setResult(result);
    const valorPorKm = 1.50; // em reais
    const distancia = result.distance; // em km
    const valor = distancia * valorPorKm;
    setValorCorrida(valor);
    setDistanciaCorrida(distancia);
  };

    // Função de geolocalização :
    const getCoordinatesFromLocationName = async (locationName) => {
        try {
          const response = await Geocoder.from(locationName);
          const { lat, lng } = response.results[0].geometry.location;
          
          setLat(lat.toString());
          setLng(lng.toString());
          console.log('Localizado com sucesso');




        } catch (error) {
          console.log('Erro ao obter as coordenadas:', error);
          return null;
        }
      };

      
    //   console.log('teste',lat)
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [region, setRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const mapViewRef = useRef(null);


  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Tratar caso a permissão não seja concedida
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    };

    requestLocationPermission();

    const locationSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        setLocation(location.coords);
      }
    );

    return () => {
      locationSubscription.remove();
    };
  }, []);

  

  useEffect(() => {
    getCoordinatesFromLocationName(destinoD)

    const latDouble = parseFloat(lat);
    const lngDouble = parseFloat(lng);

    if (location) {
      // Define o ponto de origem como a localização atual do usuário
      setOrigin({
        
        latitude: location.latitude,
        longitude: location.longitude,

      });
   
      if (latDouble && lngDouble) {
        setDestination({
          latitude: latDouble,
          longitude: lngDouble,
        });
      } else {
        setDestination({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }

      // Define a região inicial do mapa com base na localização atual do usuário
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [refreshKey,location]);
  const handlePress = () => {
    // Lógica do evento de pressionamento do botão
    // Usando a função de callback do estado para garantir a atualização correta
    setRefreshKey(refreshKey + 1);

  };
  
 // Gera endereço do cliente com base no GPS
 const reverseGeocode = async () => {
  try {
    const response = await Geocoder.from(location.latitude, location.longitude);
    const address = response.results[0].formatted_address;
    setAddress(address);
  } catch (error) {
    console.error(error);
  }
};
// 

  const onMapReady = () => {
    // Centraliza o mapa na região definida
      mapViewRef.current.fitToCoordinates([origin, destination], {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
      
    });
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const toggleModalEntrada = () => {
    setModalVisibleEntrada(!isModalVisibleEntrada);
  };
  const toggleModalAguarda= () => {
    setModalVisibleAguarda(!isModalVisibleAguarda);
  };
  const toggleModalConfirma = () => {
    setModalVisibleConfirma(!isModalVisibleConfirma);
  };

const ChamaMapa = () => {
  handlePress();
  setMapaVisivel(true);
  reverseGeocode();
};
const Anterior = () =>{
  setCabecalhoAnterior(true);
}
useEffect(() => {
  ChamaMapa();
  const interval = setInterval(() => {
    realtimeConsulta();
    realtimeConsultaDisp();
   },5000)
   return () => {
    // Limpa o intervalo quando o componente for desmontado
    clearInterval(interval);
  };
}, []);




// ATUALIZA BANCO DE DADOS PARA REALTIME
const VerificaMotoristaAceitou = () =>{
  const dbRef = ref(getDatabase());
  const corridasRef = child(dbRef ,'/corridas/'+replaceEmail + '/');
  const handleSnapshot = (snapshot) => {
    if (snapshot.exists()) {
      const corridas = snapshot.val(); // Obtém todos os filhos do nó "Corridas"
      const motoristas = Object.values(corridas); // Obtém os valores dos filhos (corridas)
      const motorista = corridas.Motorista;
      onChangeMotorista(motorista);
    } else {
      // console.log('No data available');
    }
  };

  const interval = setInterval(() => {
    get(corridasRef)
      .then(handleSnapshot)
      .catch((error) => {
        console.error(error);
      });
  }, 1000); // Executa a consulta a cada 5 segundos (5000 milissegundos)

  return () => {
    clearInterval(interval); // Limpa o intervalo quando o componente é desmontado
    off(corridasRef, handleSnapshot); // Interrompe a monitoração do nó "Corridas/"
  };
 }


  return (
    
    <View style={styles.container}>
     
    
      <View style={styles.google}  >
      <Text style={styles.valor}>R$ ${valorCorrida.toFixed(2)}    -    Distancia - {DistanciaCorrida.toFixed(0)} KM</Text>
        <GooglePlacesAutocomplete  
          styles={{
            textInput: {
              fontSize: 16,
              color: 'black',
              borderWidth: 1,
              borderRadius : 50,
              width : 300,
            },
            listView: {
              backgroundColor: 'white',

            },
          }}
         
          placeholder="Digite um endereço"

          onPress={(data, details = null) => {
            // Aqui você pode obter as informações sobre o local selecionado pelo usuário
            console.log(data, details);
            handleDestinationChange(data.description);
            ChamaMapa();


          }}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            language: 'pt-BR', // idioma das sugestões de endereço
            rankby: 'distance', // Ordenar por proximidade


          }}
         
          editable={true} // Adicionado o valor booleano true para tornar o componente editável
        ></GooglePlacesAutocomplete>
        <View style={styles.botoes}>
          <TouchableOpacity style={styles.tch} onPress={ChamaMapa}>
            <Text style={styles.btn} >Buscar</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.tch} onPress={toggleModal}>
            <Text style={styles.btn} >SOLICITAR</Text>
         </TouchableOpacity>
         </View>
      </View>
     

       <Modal isVisible={isModalVisibleEntrada}>
          <View>
            <Text style={styles.ModalEntradaTexto}>SEJA BEM VINDA AO MOTO UBA</Text>
            <Text style={styles.ModalEntradaTexto2}>CASO TENHA ALGUM PROBLEMA OU DUVIDAS E SUGESTÕES PODE
            ENTRAR EM CONTATO CONOSCO VIA WHATSAPP CLICANDO NO ICONE ABAIXO
            </Text>
            <TouchableOpacity onPress={toggleModalEntrada}><Text style={styles.ModalEntradabtn}>ENTENDI</Text></TouchableOpacity>
          </View>
       </Modal>
       <Modal isVisible={isModalVisible}>
        <View>
      
            <Text style={styles.ModalPagamentoCabecalho}>SELECIONE A FORMA DE PAGAMENTO DESEJADA</Text>
            <TouchableOpacity onPress={realtime}><Text style={styles.ModalPagamentoItens}>DINHEIRO</Text></TouchableOpacity>
            {/* <TouchableOpacity><Text style={styles.ModalPagamentoItens}>PIX</Text></TouchableOpacity> */}
            <TouchableOpacity onPress={toggleModal}><Text style={styles.ModalPagamentoItens}>CANCELAR</Text></TouchableOpacity>
        </View>
       </Modal>
       <Modal isVisible={isModalVisibleAguarda}>
        <View style={styles.ModalAguarda}>
        <Text style={styles.ModalAguardaTxt}>CORRIDA SOLICITA, POR FAVOR AGUARDE A CONFIRMAÇÃO </Text>
        <Image style={styles.loadgif} source={require('../Material/load.gif')}/>
        </View>
       </Modal>
       <Modal isVisible={isModalVisibleConfirma}>
       <View style={styles.ModalAguarda}>
       <Ionicons style={styles.iconImg} size={250} name="person-circle-outline" color="white"></Ionicons>
        <Text style={styles.ModalConfimaTxt}> {Motorista.toUpperCase()} ACEITOU SUA CORRIDA</Text>
        <TouchableOpacity onPress={toggleModalConfirma}><Text style={styles.ModalPagamentoItens}>CONFIRMAR</Text></TouchableOpacity>

       </View>
       </Modal>
 
        
      <View style={styles.mapas}  >
      {location && mapaVisivel && region && (
        <MapView
         
          style={styles.map}
          region={region}
          onMapReady={onMapReady}
          ref={mapViewRef}
        >
          {origin && (
            <Marker coordinate={origin} title="Origem">
                <Ionicons name="triangle" size={30} color="hotpink" />
            </Marker>
            
          )}
          {destination && (
            <Marker coordinate={destination} title="Destino">
             <Ionicons name="pin" size={30} color="hotpink" />
            </Marker>
          )}
          {origin && destination && (
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={3}
              strokeColor="hotpink"
              onReady={onReady}
              
            />
          )}
        </MapView>
      )}
</View> 

        <View  style={styles.icon}>
          {/* <Image style={styles.iconImg} source={require('../Material/whatsapp.png')}/> */}
                  <TouchableOpacity onPress={() => {
          Linking.canOpenURL(whatsappUrl)
            .then(supported => {
              if (supported) {
                return Linking.openURL(whatsappUrl);
              } else {
                console.log('Não é possível abrir o URL do WhatsApp');
              }
            })
            .catch(err => console.error('Um erro ocorreu', err));
        }}>
          <Ionicons size={60} name="logo-whatsapp" color="#25D366" />
        </TouchableOpacity>
          </View>  
        
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',

  },
  icon:{
    position: 'absolute',
    zIndex: 2,
    flex: 1,
    bottom: 50,
    right: 10,
  },
  iconImg:{
    top: -50,
  },
  map: {
    flex: 1,
  },
  mapas:{
    flex: 1,
  },
  TextInput:{
    borderWidth: 1,
    borderRadius : 50,
    backgroundColor : 'white',
    fontSize : 20,
    width: '100%',
    height : 40,
    textAlign : 'center',
    marginBottom: 10,
    left: 0,
    right: 0,
    top: 0,
  },
  google:{
    flexDirection: 'column',
    width:'100%',
    position: 'absolute',
    zIndex: 2,
    top: 40,
    flex: 1,
  },
  tch:{
    width: 200,
  },
  btn:{
    width : '90%',
    paddingTop: 3,
    height: 40,
    fontSize : 25,
    borderWidth: 1,
    borderRadius : 50,
    textAlign: 'center',
    backgroundColor: '#dc8fa3',
    color:'white',
  },
  botoes:{
    flex:1,
    flexDirection: 'row',
    
  },
  valor:{
    // width:300,
    fontSize : 20,
    color: 'white',
    backgroundColor:'#dc8fa3',
    textAlign: 'center',
    borderRadius : 50,
    right: 0,
    top: 0,
    bottom: 0,
  },

  ModalPagamentoCabecalho:{
    color:"white",fontSize:30,top:-200,
    textShadowColor:"#DDA0DD",
    textShadowOffset:{ width: 3, height: 2 },
    textShadowRadius:3,
    top: -100,
  },
  ModalPagamentoItens:{
    backgroundColor:"#DDA0DD",
    height:50,
    borderRadius: 50,
    textAlign: 'center',
    color:"white",
    fontSize:35,
    textShadowColor:"black",
    textShadowOffset:{ width: 2, height: 2 },
    textShadowRadius:3,
    marginBottom: 10,
    top: 10,

  },
  ModalEntradaTexto:{
    color:"white",fontSize:40,top:-100,
    textShadowColor:"#DDA0DD",
    textShadowOffset:{ width: 3, height: 2 },
    textShadowRadius:3,
    textAlign: 'center',
  },
  ModalEntradaTexto2:{
    color:"white",fontSize:20,top:-50,
    textShadowColor:"#DDA0DD",
    textShadowOffset:{ width: 3, height: 2 },
    textShadowRadius:3,
    textAlign: 'center',
  },
  ModalEntradabtn:{
    backgroundColor:"#DDA0DD",
    height:30,
    borderRadius: 50,
    textAlign: 'center',
    color:"white",
    fontSize:20,
    textShadowColor:"black",
    textShadowOffset:{ width: 2, height: 2 },
    textShadowRadius:3,
    marginBottom: 10,
    top: 10,
  },
  ModalAguardaTxt:{
    color: 'white',
    fontSize:30,
    top:-50,
    textAlign: 'center',

  },
  loadgif:{
    width: 200,
    height: 200,
  },
  ModalAguarda:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',  },

    ModalConfimaTxt:{
      color: 'white',
      fontSize:30,
      top:-50,
      textAlign: 'center',
    },
});

export default TelaInicial;
