import {
  ButtonIcon,
  ButtonText,
  ColorScheme,
  ContentView,
  ContentViewType,
  Header,
  Input,
  InputTypes,
  Layout,
  Modal,
  SizeScheme,
  Takoz,
} from "@19sth/react-native-pieces";
import {
  faArrowUpRightFromSquare,
  faCircleQuestion,
  faFloppyDisk,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { KEY_TOPICS, ITopic } from "../util";

export default function Main({ navigation }) {
  const [showModal, setShowModal] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [topics, setTopics] = useState([] as ITopic[]);
  const asyncTopics = useAsyncStorage(KEY_TOPICS);
  const isFocused = useIsFocused();

  const load = async () => {
    const topicsLocal = JSON.parse((await asyncTopics.getItem()) || "[]");
    setTopics(topicsLocal);
  };

  useEffect(() => {
    load();
  }, [isFocused]);

  return (
    <Layout>
      <Header
        navigation={navigation}
        title="Memorise"
        buttons={[
          {
            faIcon: faCircleQuestion,
            handleClick: () => {
              window.open(
                "https://mujdecisy.github.io/app/memorise-test-yourself",
                "blank"
              );
            },
          },
          {
            faIcon: faFloppyDisk,
            handleClick: () => {
              navigation.push("IO");
            },
          },
          {
            faIcon: faPlus,
            handleClick: () => {
              setTaskName("");
              setShowModal(true);
            },
          },
        ]}
      />
      <ContentView viewType={ContentViewType.SCROLLVIEW}>
        {topics.map((e, ix) => (
          <View
            key={`topic_${ix}`}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 15,
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: ColorScheme.get().secondary,
              padding: 10,
            }}
          >
            <View>
              <Text style={{ fontSize: SizeScheme.get().font.c }}>
                {e.name}
              </Text>
            </View>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <View style={{ marginRight: 20 }}>
                <Text style={{ fontSize: SizeScheme.get().font.c }}>
                  {e.cards.length}
                </Text>
              </View>
              <ButtonIcon
                faIcon={faArrowUpRightFromSquare}
                handleClick={() => {
                  navigation.push("Topic", { topicIndex: ix });
                }}
              />
            </View>
          </View>
        ))}
      </ContentView>
      <Modal
        visible={showModal}
        handleClose={() => {
          setShowModal(false);
        }}
        style={{ height: 230 }}
      >
        <Input
          label="Topic Name"
          value={[taskName]}
          handleChange={(val) => {
            setTaskName(val[0]);
          }}
          type={InputTypes.TEXT}
        />
        <Takoz />
        <ButtonText
          label="Create"
          handleClick={async () => {
            const topicsLocal = JSON.parse(
              (await asyncTopics.getItem()) || "[]"
            );
            topicsLocal.push({
              name: taskName,
              cards: [],
            } as ITopic);
            await asyncTopics.setItem(JSON.stringify(topicsLocal));
            await load();
            setShowModal(false);
          }}
        />
      </Modal>
    </Layout>
  );
}
