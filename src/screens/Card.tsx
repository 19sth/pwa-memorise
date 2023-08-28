import {
  ButtonText,
  ColorScheme,
  ContentView,
  Header,
  Layout,
  SizeScheme,
  Takoz,
} from "@19sth/react-native-pieces";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useIsFocused } from "@react-navigation/native";
import { View, Text } from "react-native";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { ICard, ITopic, KEY_TOPICS, createShuffledIndices } from "../util";
import { useEffect, useState } from "react";

export default function Card({ navigation, route }) {
  const asyncTopics = useAsyncStorage(KEY_TOPICS);
  const isFocused = useIsFocused();
  const [topics, setTopics] = useState([] as ITopic[]);
  const [card, setCard] = useState({} as ICard);
  const [shuffled, setShuffled] = useState([] as number[]);
  const [shufflePivot, setShufflePivot] = useState(0);
  const [trainingStep, setTrainingStep] = useState(0); // 0 new word, 1 revealed
  const [secret, setSecret] = useState(2); // 0 no secret, 1 key secret, 2 value secret

  const load = async () => {
    const topicsLocal = JSON.parse((await asyncTopics.getItem()) || "[]");
    setTopics(topicsLocal);
  };

  useEffect(() => {
    load();
  }, [isFocused]);

  useEffect(() => {
    if (
      route.params &&
      route.params.topicIndex !== undefined &&
      topics[route.params.topicIndex] !== undefined
    ) {
      if (route.params.cardIndex !== undefined) {
        setCard(topics[route.params.topicIndex].cards[route.params.cardIndex]);
        setSecret(0);
      } else if (route.params.training === true) {
        const shuffledIndices = createShuffledIndices(
          topics[route.params.topicIndex].cards.length
        );
        setShuffled(shuffledIndices);
        setCard(
          topics[route.params.topicIndex].cards[shuffledIndices[shufflePivot]]
        );
      }
    }
  }, [topics]);

  const buttons = [];
  if (route.params.cardIndex !== undefined) {
    buttons.push({
      faIcon: faTrashCan,
      handleClick: async () => {
        const localTopics = [...topics];
        localTopics[route.params.topicIndex].cards.splice(route.params.cardIndex,1);
        await asyncTopics.setItem(JSON.stringify(localTopics));
        navigation.goBack();
      },
    });
  }

  return (
    <Layout>
      <Header navigation={navigation} title="Memorise" buttons={buttons} />
      <ContentView>
        <View style={{ display: "flex", justifyContent: "space-between", height: '100%' }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: ColorScheme.get().secondary,
                padding: SizeScheme.get().gap.pad,
                borderRadius: 5,
              }}
            >
              <Text style={{ fontSize: SizeScheme.get().font.a }}>
                {secret !== 1 ? card.key : "*************"}
              </Text>
            </View>

            <Takoz />

            <View
              style={{
                borderWidth: 1,
                borderColor: ColorScheme.get().secondary,
                padding: SizeScheme.get().gap.pad,
                borderRadius: 5,
                maxHeight: SizeScheme.get().screen.height.window/2,
                overflow: 'scroll'
              }}
            >
              <Text style={{ fontSize: SizeScheme.get().font.b }}>
                {secret !== 2 ? card.value : "*************"}
              </Text>
            </View>

            <Takoz />
          </View>

          <View>
            {route.params.training === true && (
              <ButtonText
                label={trainingStep === 0 ? "Reveal" : "Next Card"}
                handleClick={() => {
                  if (trainingStep === 0) {
                    setSecret(0);
                    setTrainingStep(1);
                  } else {
                    const localCards = topics[route.params.topicIndex].cards;
                    setSecret(Math.floor(Math.random() * 2) + 1);
                    setTrainingStep(0);
                    let pivot = (shufflePivot + 1) % localCards.length;
                    setCard(localCards[shuffled[pivot]]);
                    setShufflePivot(pivot);
                  }
                }}
              />
            )}

            <Takoz/>
          </View>
        </View>
      </ContentView>
    </Layout>
  );
}
