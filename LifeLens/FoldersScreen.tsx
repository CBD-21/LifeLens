import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TextInput, TouchableOpacity } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'notesDB.db',
    location: 'default',
  },
  () => {},
  error => {
    console.log('Error opening database:', error);
  }
);

class Folders {
  static getAllFolders(callback: (folders: { id: number; name: string }[]) => void) {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM foldersDB', [], (_, { rows }) => {
        const folders = [];
        for (let i = 0; i < rows.length; i++) {
          folders.push(rows.item(i));
        }
        callback(folders);
      });
    });
  }

  static deleteFolder(id: number, callback: () => void) {
    db.transaction(tx => {
      // Eliminar la carpeta
      tx.executeSql('DELETE FROM foldersDB WHERE id = ?', [id], () => {
        // Eliminar la propiedad folder_id de las notas correspondientes a esa carpeta
        tx.executeSql('UPDATE notesDB SET folder_id = NULL WHERE folder_id = ?', [id], () => {
          callback();
        });
      });
    });
  }

  static createFolder(name: string, callback: () => void) {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO foldersDB (name) VALUES (?)', [name], () => {
        callback();
      });
    });
  }
}

const FoldersScreen = () => {
  const navigation = useNavigation();
  const [folders, setFolders] = useState<{ id: number; name: string }[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = () => {
    Folders.getAllFolders(folders => {
      setFolders(folders);
    });
  };

  const deleteFolder = (id: number) => {
    Folders.deleteFolder(id, fetchFolders);
  };

  const createFolder = () => {
    if (newFolderName.trim() !== '') {
      Folders.createFolder(newFolderName, () => {
        setNewFolderName('');
        fetchFolders();
        navigation.navigate('Notas');
      });
    } else {
      setErrorMessage('Por favor, introduce un nombre para la carpeta.');
    }
  };

  const navigateToNotesInFolder = (folderId: number) => {
    navigation.navigate('Notas en la carpeta', { folderId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Carpetas</Text>
      <View style={styles.newFolderContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la carpeta"
          value={newFolderName}
          onChangeText={setNewFolderName}
        />
        <View style={{ marginTop: 7 }}>
          <Button title="Crear" onPress={createFolder} />
        </View>

      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <FlatList
        data={folders}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigateToNotesInFolder(item.id)}>
            <View style={styles.folderItem}>
              <Text style={styles.folderName}>{item.name}</Text>
              <Button title="Eliminar" onPress={() => deleteFolder(item.id)} color="red" />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  newFolderContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  folderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  folderName: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FoldersScreen;
