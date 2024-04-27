import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'notesDB.db',
    createFromLocation: '~notesDB.db',
  },
  () => {},
  error => {
    console.log('Error opening database:', error);
  }
);

class NotesDatabase {
  static initDatabase() {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS notesDB (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT)'
      );
    });
  }

  static saveNote(title: string, description: string) {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO notesDB (title, description) VALUES (?, ?)', [title, description]);
    });
  }

  static getAllNotes(callback: (notes: { id: number; title: string; description: string }[]) => void) {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM notesDB', [], (_, { rows }) => {
        const notes = [];
        for (let i = 0; i < rows.length; i++) {
          notes.push(rows.item(i));
        }
        callback(notes);
      });
    });
  }
}

NotesDatabase.initDatabase();

const App = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState<{ id: number; title: string; description: string }[]>([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = () => {
    NotesDatabase.getAllNotes(notes => {
      setNotes(notes);
    });
  };

  const saveNote = () => {
    if (title && description) {
      NotesDatabase.saveNote(title, description);
      setTitle('');
      setDescription('');
      fetchNotes();
    } else {
      console.log('Por favor, introduce un título y una descripción para guardar la nota.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Guardar Nota</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={text => setTitle(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={text => setDescription(text)}
      />
      <Button title="Guardar Nota" onPress={saveNote} />
      <Text style={[styles.header, { marginTop: 20 }]}>Notas Guardadas</Text>
      <FlatList
        data={notes}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteDescription}>{item.description}</Text>
          </View>
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
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  noteItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteDescription: {
    fontSize: 14,
  },
});

export default App;
