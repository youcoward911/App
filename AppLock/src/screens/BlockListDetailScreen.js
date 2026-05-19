import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PanResponder,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import { C, T, NEU_RAISED } from "../utils/theme";
import GlowButton from "../components/GlowButton";
import { showAlert } from "../components/CustomAlert";
import { isScreenTimeAvailable, showAppPickerForList, deleteBlockList as deleteBlockListNative } from "../native/ScreenTime";
import { lightTap, successTap, warningTap } from "../utils/haptics";

export default function BlockListDetailScreen({ route, navigation }) {
  const listId = route?.params?.listId || "default";
  const { state, dispatch } = useAppLock();
  const list = (state.blockLists || []).find((l) => l.id === listId);

  const [name, setName] = useState(list?.name || "Block List");
  const [editing, setEditing] = useState(false);

  if (!list) {
    navigation.goBack();
    return null;
  }

  const handleAddRemove = async () => {
    if (!isScreenTimeAvailable()) {
      showAlert("Not Available", "App selection requires the full build.");
      return;
    }
    try {
      const result = await showAppPickerForList(listId);
      if (result.selectedCount >= 0) {
        dispatch({ type: "SET_APP_COUNT", payload: { listId, count: result.selectedCount } });
      }
    } catch (e) {
      showAlert("Error", "Something went wrong opening the app picker.");
    }
  };

  const handleSave = () => {
    successTap();
    if (name.trim() && name !== list.name) {
      dispatch({ type: "UPDATE_BLOCK_LIST", payload: { id: listId, name: name.trim() } });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (state.blockLists.length <= 1) {
      showAlert("Can't Delete", "You need at least one block list.");
      return;
    }
    warningTap();
    showAlert(
      "Delete List?",
      `Delete "${list.name}" and all its app selections? This can't be undone.`,
      [
        {
          text: "Delete",
          onPress: async () => {
            dispatch({ type: "DELETE_BLOCK_LIST", payload: { id: listId } });
            if (isScreenTimeAvailable()) {
              try { await deleteBlockListNative(listId); } catch (e) {}
            }
            navigation.goBack();
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Handle */}
        <View style={styles.handleZone}>
          <View style={styles.handle} />
        </View>

        {/* Name */}
        <View style={styles.nameRow}>
          {editing ? (
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              onBlur={() => setEditing(false)}
              autoFocus
              maxLength={30}
            />
          ) : (
            <TouchableOpacity onPress={() => { lightTap(); setEditing(true); }} style={styles.nameRow}>
              <Text style={styles.nameText}>{name}</Text>
              <Text style={styles.editIcon}> /</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <Text style={styles.desc}>
          Only these apps will be blocked during your lock session.
        </Text>

        {/* Apps section */}
        <View style={styles.appsHeader}>
          <View>
            <Text style={styles.appsLabel}>Apps</Text>
            <Text style={styles.appsCount}>{list.appCount} app{list.appCount !== 1 ? "s" : ""}</Text>
          </View>
          <TouchableOpacity onPress={() => { lightTap(); handleAddRemove(); }}>
            <Text style={styles.addRemoveBtn}>Add / Remove</Text>
          </TouchableOpacity>
        </View>

        {/* App count display */}
        {list.appCount > 0 ? (
          <View style={[styles.appsCard, NEU_RAISED]}>
            {Array.from({ length: Math.min(list.appCount, 6) }).map((_, i) => (
              <View key={i} style={styles.appPlaceholder}>
                <View style={styles.appPlaceholderIcon} />
                <View style={styles.appPlaceholderLine} />
              </View>
            ))}
            {list.appCount > 6 && (
              <Text style={styles.moreApps}>+{list.appCount - 6} more</Text>
            )}
          </View>
        ) : (
          <View style={[styles.appsCard, NEU_RAISED, styles.appsCardEmpty]}>
            <Text style={styles.emptyText}>No apps selected yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add / Remove" to choose apps</Text>
          </View>
        )}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Save */}
        <GlowButton title="Save" onPress={handleSave} />

        {/* Delete */}
        {state.blockLists.length > 1 && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete {list.name}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 30 },

  handleZone: { paddingTop: 12, paddingBottom: 8, alignItems: "center" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.pinkPale },

  // Name
  nameRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  nameText: { fontSize: 28, fontWeight: "900", color: C.text },
  editIcon: { fontSize: 20, color: C.textTertiary },
  nameInput: {
    fontSize: 28,
    fontWeight: "900",
    color: C.text,
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: C.pink,
    paddingBottom: 4,
  },

  // Description
  desc: {
    fontSize: 14,
    fontWeight: "500",
    color: C.textSecondary,
    marginTop: 12,
    lineHeight: 20,
  },

  // Apps header
  appsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 24,
    marginBottom: 12,
  },
  appsLabel: { fontSize: 16, fontWeight: "800", color: C.text },
  appsCount: { fontSize: 12, fontWeight: "500", color: C.textSecondary, marginTop: 2 },
  addRemoveBtn: { fontSize: 15, fontWeight: "700", color: C.pink },

  // Apps card
  appsCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
  },
  appsCardEmpty: {
    alignItems: "center",
    paddingVertical: 30,
  },
  appPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.pinkPale,
  },
  appPlaceholderIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.pinkPale,
    marginRight: 12,
  },
  appPlaceholderLine: {
    height: 12,
    width: 100,
    borderRadius: 6,
    backgroundColor: C.pinkPale,
  },
  moreApps: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textSecondary,
    textAlign: "center",
    marginTop: 10,
  },
  emptyText: { fontSize: 16, fontWeight: "700", color: C.textSecondary },
  emptySubtext: { fontSize: 13, fontWeight: "500", color: C.textTertiary, marginTop: 4 },

  // Delete
  deleteBtn: { alignItems: "center", marginTop: 16 },
  deleteBtnText: { fontSize: 15, fontWeight: "700", color: C.pink },
});
