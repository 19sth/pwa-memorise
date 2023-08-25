import { ScreenIOStorage } from "@19sth/react-native-pieces";
import { KEY_TOPICS } from "../util";

export function IO({navigation}) {
    return (
        <ScreenIOStorage
        navigation={navigation}
        relatedKeys={[KEY_TOPICS]}/>
    );
}