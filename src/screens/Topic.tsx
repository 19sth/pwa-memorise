import {
  ButtonText,
  ContentView,
  ContentViewType,
  Header,
  Input,
  InputTypes,
  Layout,
  Modal,
  Settings,
  Takoz,
  ButtonIcon,
  SizeScheme,
  ColorScheme,
} from "@19sth/react-native-pieces";
import {
  faArrowUpRightFromSquare,
  faPersonRunning,
  faPlus,
  faSquare,
  faSquareCheck,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { KEY_TOPICS, ITopic, ICard } from "../util";

export default function Topic({ navigation, route }) {
  const [topic, setTopic] = useState({} as ITopic);
  const [topics, setTopics] = useState([] as ITopic[]);
  const [showModal, setShowModal] = useState(false);
  const [newCard, setNewCard] = useState({} as ICard);

  const asyncTopics = useAsyncStorage(KEY_TOPICS);
  const isFocused = useIsFocused();

  const load = async () => {
    const topicsLocal = JSON.parse((await asyncTopics.getItem()) || "[]");
    setTopics(topicsLocal);
  };

  useEffect(() => {
    load();
  }, [isFocused]);

  useEffect(() => {
    if (route.params && route.params.topicIndex !== undefined) {
      setTopic(topics[route.params.topicIndex]);
    }
  }, [topics]);

  return (
    <Layout>
      <Header
        navigation={navigation}
        title="Memorise"
        buttons={[
          {
            faIcon: faTrashCan,
            handleClick: async () => {
              const localTopics = [...topics];
              localTopics.splice(route.params.topicIndex, 1);
              await asyncTopics.setItem(JSON.stringify(localTopics));
              navigation.goBack();
            },
          },
          {
            faIcon: faPersonRunning,
            handleClick: () => {
              navigation.push("Card", {
                topicIndex: route.params.topicIndex,
                training: true,
              });
            },
          },
          {
            faIcon: faPlus,
            handleClick: () => {
              setNewCard({
                key: "",
                value: "",
                learned: false
              });
              setShowModal(true);
            },
          },
        ]}
      />
      <ContentView viewType={ContentViewType.SCROLLVIEW}>
        <Text style={{ fontSize: SizeScheme.get().font.b, fontWeight: "bold" }}>
          {(topic.name || "").toUpperCase()}
        </Text>
        <Takoz />
        <View>
          {topic.cards &&
            topic.cards.map((e, ix) => (
              <View
                key={`card_${ix}`}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: SizeScheme.get().gap.pad,
                  borderBottomWidth: 1,
                  borderBottomColor: ColorScheme.get().secondary,
                  padding: 10,
                }}
              >
                <View>
                  <Text style={{ fontSize: SizeScheme.get().font.c }}>
                    {e.key}
                  </Text>
                </View>
                <View style={{display:"flex", flexDirection:"row"}}>
                  <ButtonIcon
                    faIcon={ (e.learned === true) ? faSquareCheck : faSquare}
                    handleClick={ async () => {
                      const localTopics = [...topics];
                      e.learned = (e.learned === true)? false: true;
                      localTopics[route.params.topicIndex].cards[ix].learned = e.learned;
                      await asyncTopics.setItem(JSON.stringify(localTopics));
                      setTopics(localTopics);
                    }}
                  />
                  <Takoz/>
                  <ButtonIcon
                    faIcon={faArrowUpRightFromSquare}
                    handleClick={() => {
                      navigation.push("Card", {
                        topicIndex: route.params.topicIndex,
                        cardIndex: ix,
                      });
                    }}
                  />
                </View>
              </View>
            ))}
        </View>
      </ContentView>

      <Modal
        visible={showModal}
        handleClose={() => {
          setShowModal(false);
        }}
      >
        <Input
          label="Key"
          value={[newCard.key]}
          handleChange={(val) => {
            const newCardLocal = { ...newCard };
            newCardLocal.key = val[0];
            setNewCard(newCardLocal);
          }}
          type={InputTypes.TEXT}
        />

        <Input
          label="Value"
          value={[newCard.value]}
          handleChange={(val) => {
            const newCardLocal = { ...newCard };
            newCardLocal.value = val[0];
            setNewCard(newCardLocal);
          }}
          type={InputTypes.TEXT}
          settings={[Settings.TEXT_MULTILINE_6]}
        />

        <Takoz />

        <ButtonText
          label="Save"
          handleClick={async () => {
            const localTopics = JSON.parse(await asyncTopics.getItem());
            localTopics[route.params.topicIndex].cards.push(newCard);
            await asyncTopics.setItem(JSON.stringify(localTopics));
            setNewCard({
              key: "",
              value: "",
            });
            await load();
            setShowModal(false);
          }}
        />
      </Modal>
    </Layout>
  );
}
