import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';

import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'notesDB.db',
    location: 'default',
  },
  () => { },
  error => {
    console.log('Error opening database:', error);
  }
);

class NotesDatabase {
  static initDatabase() {
    // Verificar si la base de datos ya ha sido inicializada
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS databaseInfo (initialized INTEGER)'
      );

      tx.executeSql(
        'SELECT * FROM databaseInfo',
        [],
        (_, { rows }) => {
          if (rows.length === 0) {
            // La base de datos no ha sido inicializada, inicializarla
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS notesDB (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, priority TEXT, status TEXT, created_at DATETIME, folder_id INTEGER)'
            );

            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS foldersDB (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)'
            );

            tx.executeSql(
              'INSERT INTO foldersDB (name) VALUES (?)',
              ['Trabajo']
            );

            tx.executeSql(
              'INSERT INTO foldersDB (name) VALUES (?)',
              ['Casa']
            );

            // Marcar la base de datos como inicializada
            tx.executeSql(
              'INSERT INTO databaseInfo (initialized) VALUES (?)',
              [1]
            );
          }
        }
      );
    });
  }

  static saveNote(title: string, description: string, priority: string, status: string, folderId: number, id?: number) {
    const currentDate = new Date().toISOString();
    db.transaction(tx => {
      if (id) {
        tx.executeSql('UPDATE notesDB SET title = ?, description = ?, priority = ?, status = ?, created_at = ?, folder_id = ? WHERE id = ?', [title, description, priority, status, currentDate, folderId, id]);
      } else {
        tx.executeSql('INSERT INTO notesDB (title, description, priority, status, created_at, folder_id) VALUES (?, ?, ?, ?, ?, ?)', [title, description, priority, status, currentDate, folderId]);
      }
    });
  }

  static getAllNotes(callback: (notes: { id: number; title: string; description: string; priority: string; status: string; created_at: string }[]) => void) {
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

  static deleteNote(id: number, callback: () => void) {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM notesDB WHERE id = ?', [id], callback);
    });
  }

  static updateNoteStatus(id: number, status: string, callback: () => void) {
    db.transaction(tx => {
      tx.executeSql('UPDATE notesDB SET status = ? WHERE id = ?', [status, id], callback);
    });
  }
}

NotesDatabase.initDatabase();

interface Folder {
  id: number;
  name: string;
}

const App = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [priority, setPriority] = useState('Alto');
  const [notes, setNotes] = useState<{ id: number; title: string; description: string; priority: string; status: string; created_at: string }[]>([]);
  const [editingNote, setEditingNote] = useState<{ id: number; title: string; description: string; priority: string; status: string; created_at: string } | null>(null);
  const [filterPriority, setFilterPriority] = useState('Todas');
  const [isCompleted, setIsCompleted] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const filteredNotes = filterPriority === 'Todas' ? notes : notes.filter(note => note.priority === filterPriority);

  useEffect(() => {
    fetchNotes();
    fetchFolders();
  }, [isCompleted]);

  const fetchNotes = () => {
    NotesDatabase.getAllNotes(notes => {
      const sortedNotes = notes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      let filtered = sortedNotes;
      if (isCompleted) {
        filtered = sortedNotes.filter(note => note.status === 'No completado');
      }
      setNotes(filtered);
    });
  };

  const fetchFolders = () => {
    NotesDatabase.getAllFolders((folders: Folder[]) => { // Especifica el tipo de datos de folders recibidos de getAllFolders
      setFolders(folders);
    });
  };

  const saveNote = () => {
    if (title && description && selectedFolderId) { // Asegúrate de que se haya seleccionado una carpeta
      setErrorMessage('');
  
      if (editingNote) {
        NotesDatabase.saveNote(title, description, priority, 'No completado', selectedFolderId, editingNote.id); // Agrega selectedFolderId como argumento
        setEditingNote(null);
      } else {
        NotesDatabase.saveNote(title, description, priority, 'No completado', selectedFolderId); // Agrega selectedFolderId como argumento
      }
      setTitle('');
      setDescription('');
      setPriority('Alto'); // Reset priority to default after saving
      fetchNotes();
    } else {
      setErrorMessage('Por favor, introduce un título y una descripción y selecciona una carpeta para guardar la nota.');
    }
  };
  

  const deleteNote = (id: number) => {
    NotesDatabase.deleteNote(id, () => {
      fetchNotes();
    });
  };

  const toggleNoteStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'No completado' ? 'Completado' : 'No completado';
    NotesDatabase.updateNoteStatus(id, newStatus, () => {
      fetchNotes(); // Update the list after changing the status
    });
  };

  const toggleIsCompleted = (value: boolean) => {
    setIsCompleted(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  const editNote = (note: { id: number; title: string; description: string; priority: string; status: string; created_at: string }) => {
    setTitle(note.title);
    setDescription(note.description);
    setPriority(note.priority);
    setEditingNote(note);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setTitle('');
    setDescription('');
    setPriority('Alto');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{editingNote ? 'Editar Nota' : 'Guardar Nota'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={text => setTitle(text)} />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={text => setDescription(text)} />
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={priority}
          style={styles.dropdown}
          onValueChange={(itemValue) => setPriority(itemValue)}>
          <Picker.Item label="Alto" value="Alto" />
          <Picker.Item label="Medio" value="Medio" />
          <Picker.Item label="Bajo" value="Bajo" />
        </Picker>
      </View>
      <View style={styles.dropdownContainer}>
      <Picker
        selectedValue={selectedFolderId}
        style={styles.dropdown}
        onValueChange={(itemValue) => setSelectedFolderId(itemValue)}>
        <Picker.Item label="Selecciona una carpeta" value={null} />
        {folders.map(folder => (
          <Picker.Item key={folder.id} label={folder.name} value={folder.id} />
        ))}
      </Picker>
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <View style={styles.editButton}>
        <Button title={editingNote ? 'Actualizar Nota' : 'Guardar Nota'} onPress={saveNote} />
      </View>
      {editingNote && <Button title="Cancelar Edición" onPress={cancelEdit} />}
      <View style={styles.checkboxContainer}>
        <Text style={styles.label}>No completadas</Text>
        <CheckBox
          value={isCompleted}
          onValueChange={setIsCompleted}
          style={styles.checkbox}
        />

      </View>

      <View style={styles.buttons}>
        <Text style={[styles.header, { marginTop: 20 }]}>Notas Guardadas</Text>
        <Picker
          selectedValue={filterPriority}
          style={styles.filterDropdown}
          onValueChange={(itemValue) => setFilterPriority(itemValue)}>
          <Picker.Item label="Todas" value="Todas" />
          <Picker.Item label="Alto" value="Alto" />
          <Picker.Item label="Medio" value="Medio" />
          <Picker.Item label="Bajo" value="Bajo" />
        </Picker>
      </View>
      <FlatList
        data={filteredNotes}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <View style={styles.buttons}>
              <Text style={styles.noteTitle} onPress={() => editNote(item)}>{item.title}</Text>
              <Text style={styles.noteDate}>{formatDate(item.created_at)}</Text>
            </View>
            <Text style={styles.noteDescription}>{item.description}</Text>
            <Text style={styles.notePriority}>Prioridad: {item.priority}</Text>
            <Text style={[styles.noteStatus]}>
              Estado: {' '}    
              <Text style={[styles.noteStatus, { color: item.status === 'No completado' ? 'red' : 'green' }]}>
                {item.status}
              </Text>
            </Text>
            <View style={styles.buttons}>
              <Button
                title={item.status === 'No completado' ? 'Marcar como Completado' : 'Marcar como No completado'}
                onPress={() => toggleNoteStatus(item.id, item.status)}
                color='grey' />
              <Button title="Eliminar" onPress={() => deleteNote(item.id)} color="red" />
            </View>
          </View>
        )}
        keyExtractor={item => item.id.toString()} />
    </View>
  );
};

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    marginBottom: 5,
  },
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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    alignSelf: 'center',
  },
  label: {
    margin: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dropdownContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
  },
  filterDropdown: {
    borderWidth: 4,
    borderRadius: 5,
    paddingHorizontal: 10,
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
    textDecorationLine: 'underline',
  },
  noteDescription: {
    fontSize: 14,
  },
  notePriority: {
    fontSize: 14,
  },
  noteStatus: {
    fontSize: 14,
    marginBottom: 5,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default App;
