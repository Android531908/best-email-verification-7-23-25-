@@ .. @@
   return (
-    <div className="fixed inset-0 w-full h-full flex bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
+    <div className="fixed inset-0 w-full h-full flex bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
       {/* Sidebar */}
-      <Sidebar 
-        activeItem="messages"
-        userType="tutor"
-      />
+      <div className="hidden lg:block w-72 bg-white/95 backdrop-blur-sm border-r border-amber-200 shadow-xl">
+        <div className="p-6 border-b border-amber-200">
+          <div className="flex items-center space-x-3">
+            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
+              <BookOpen className="h-6 w-6 text-white" />
+            </div>
+            <div>
+              <h2 className="text-lg font-bold text-amber-900">Curio Tutors</h2>
+              <p className="text-xs text-amber-700">Where Learning Comes to Life</p>
+            </div>
+          </div>
+        </div>
+        
+        <div className="p-4">
+          <div className="flex items-center justify-between mb-4">
+            <h3 className="text-lg font-semibold text-amber-900">Messages</h3>
+            <button className="p-2 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors">
+              <Plus className="h-4 w-4 text-amber-700" />
+            </button>
+          </div>
+          
+          <div className="space-y-2">
+            {['Inbox', 'Sent', 'Drafts', 'Archived'].map(folder => (
+              <button 
+                key={folder}
+                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-amber-100 transition-colors"
+              >
+                <span className="text-amber-900">{folder}</span>
+                {folder === 'Inbox' && (
+                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">3</span>
+                )}
+              </button>
+            ))}
+          </div>
+        </div>
+      </div>
 
       {/* Main Content */}
-      <div className="flex-1 lg:ml-72 flex flex-col">
+      <div className="flex-1 flex flex-col">
       {/* Header */}
-      <div className="bg-white shadow-lg border-b border-green-200 p-4">
+      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-amber-200 p-4">
         <div className="flex items-center justify-between">
           <div className="flex items-center space-x-3">
             <button
               onClick={() => setSelectedStudent(null)}
-              className="p-2 bg-green-100 rounded-xl hover:bg-green-200 transition-colors"
+              className="p-2 bg-amber-100 rounded-xl hover:bg-amber-200 transition-colors"
             >
-              <X className="h-5 w-5 text-green-600" />
+              <X className="h-5 w-5 text-amber-700" />
             </button>
-            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
-              <span className="text-green-800 font-bold">{selectedStudent.avatar}</span>
+            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
+              <span className="text-white font-bold">{selectedStudent.avatar}</span>
             </div>
             <div>
-              <h2 className="text-green-800 font-bold">{selectedStudent.name}</h2>
-              <div className="flex items-center space-x-2 text-sm text-green-600">
-                <BookOpen className="h-3 w-3" />
+              <h2 className="text-amber-900 font-bold">{selectedStudent.name}</h2>
+              <div className="flex items-center space-x-2 text-sm text-amber-700">
+                <BookOpen className="h-3 w-3 text-amber-600" />
                 <span>{selectedStudent.subject}</span>
                 <span>•</span>
                 <span>Grade: {selectedStudent.grade}</span>
@@ -1,7 +1,7 @@
           <div className="flex items-center space-x-2">
             <button
               onClick={() => setFilterPriority(filterPriority === 'urgent' ? 'all' : 'urgent')}
-              className={`p-2 rounded-xl transition-colors ${
+              className={`p-2 rounded-xl transition-all duration-200 ${
                 filterPriority === 'urgent' 
                   ? 'bg-red-100 text-red-600' 
-                  : 'bg-green-100 text-green-600 hover:bg-green-200'
+                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
               }`}
             >
               <Filter className="h-4 w-4" />
             </button>
-            <button className="p-2 bg-green-100 rounded-xl hover:bg-green-200 transition-colors">
-              <MoreVertical className="h-4 w-4 text-green-600" />
+            <button className="p-2 bg-amber-100 rounded-xl hover:bg-amber-200 transition-colors">
+              <MoreVertical className="h-4 w-4 text-amber-700" />
             </button>
           </div>
         </div>
@@ -1,7 +1,7 @@
             <div
               key={message.id}
               className={`max-w-xs lg:max-w-md ${message.senderType === 'tutor' ? 'order-2' : 'order-1'}`}
             >
               <div
-                className={`p-4 rounded-2xl ${
+                className={`p-4 rounded-2xl shadow-md ${
                   message.senderType === 'tutor'
-                    ? 'bg-green-500 text-white'
-                    : 'bg-white border border-green-200'
+                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
+                    : 'bg-white border border-amber-200'
                 }`}
               >
                 {message.priority === 'urgent' && (
@@ -1,7 +1,7 @@
                 </div>
                 )}
                 
-                <p className={`text-sm ${message.senderType === 'tutor' ? 'text-white' : 'text-green-800'}`}>
+                <p className={`text-sm ${message.senderType === 'tutor' ? 'text-white' : 'text-amber-900'}`}>
                   {message.content}
                 </p>
                 
@@ -1,7 +1,7 @@
                 </div>
                 )}
                 
-                <div className="flex items-center justify-between mt-2">
-                  <span className={`text-xs ${message.senderType === 'tutor' ? 'text-white/70' : 'text-green-600'}`}>
+                <div className="flex items-center justify-between mt-3">
+                  <span className={`text-xs ${message.senderType === 'tutor' ? 'text-white/70' : 'text-amber-600'}`}>
                     {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   <div className="flex items-center space-x-1">
@@ -1,7 +1,7 @@
                     <button
                       onClick={() => toggleMessageFlag(message.id)}
-                      className={`p-1 rounded ${message.flagged ? 'text-yellow-400' : 'text-white/50 hover:text-white/70'}`}
+                      className={`p-1 rounded ${message.flagged ? 'text-yellow-400' : message.senderType === 'tutor' ? 'text-white/50 hover:text-white/70' : 'text-amber-400 hover:text-amber-600'}`}
                     >
                       <Flag className="h-3 w-3" />
                     </button>
@@ -1,7 +1,7 @@
       </div>
 
       {/* Message Input */}
-      <div className="bg-white border-t border-green-200 p-4">
+      <div className="bg-white/95 backdrop-blur-sm border-t border-amber-200 p-4">
         {/* Attachments Preview */}
         {attachments.length > 0 && (
           <div className="mb-3 flex flex-wrap gap-2">
             {attachments.map((file, index) => (
-              <div key={index} className="flex items-center space-x-2 bg-green-100 rounded-lg p-2">
-                <Paperclip className="h-3 w-3 text-green-600" />
-                <span className="text-xs text-green-800">{file.name}</span>
+              <div key={index} className="flex items-center space-x-2 bg-amber-100 rounded-lg p-2">
+                <Paperclip className="h-3 w-3 text-amber-700" />
+                <span className="text-xs text-amber-900">{file.name}</span>
                 <button
                   onClick={() => removeAttachment(index)}
                   className="text-red-500 hover:text-red-700"
@@ -1,7 +1,7 @@
 
         {/* Quick Templates */}
         {showTemplates && (
-          <div className="mb-3 bg-green-50 rounded-xl p-3">
-            <h4 className="text-sm font-medium text-green-800 mb-2">Quick Replies</h4>
+          <div className="mb-3 bg-amber-50 rounded-xl p-3 border border-amber-200">
+            <h4 className="text-sm font-medium text-amber-900 mb-2">Quick Replies</h4>
             <div className="grid grid-cols-1 gap-1">
               {quickTemplates.map((template, index) => (
                 <button
@@ -1,7 +1,7 @@
                   onClick={() => insertTemplate(template)}
-                  className="text-left text-sm text-green-700 hover:bg-green-100 rounded-lg p-2 transition-colors"
+                  className="text-left text-sm text-amber-700 hover:bg-amber-100 rounded-lg p-2 transition-colors"
                 >
                   {template}
                 </button>
@@ -1,7 +1,7 @@
 
         {/* Message Preview */}
         {showPreview && (
-          <div className="mb-3 bg-blue-50 rounded-xl p-3 border border-blue-200">
+          <div className="mb-3 bg-blue-50 rounded-xl p-3 border border-blue-200 shadow-md">
             <div className="flex items-center justify-between mb-2">
               <h4 className="text-sm font-medium text-blue-800">Message Preview</h4>
               <button
@@ -1,7 +1,7 @@
                 <X className="h-4 w-4" />
               </button>
             </div>
-            <div className="bg-green-500 text-white p-3 rounded-lg max-w-xs">
+            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-lg max-w-xs shadow-md">
               <p className="text-sm">{newMessage}</p>
               {priority === 'urgent' && (
                 <div className="flex items-center space-x-1 mt-1">
@@ -1,7 +1,7 @@
         <div className="flex items-center justify-between mb-3">
           <div className="flex items-center space-x-2">
             <button
               onClick={() => formatText('bold')}
-              className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
+              className="p-2 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
               title="Bold"
             >
-              <Bold className="h-4 w-4 text-green-600" />
+              <Bold className="h-4 w-4 text-amber-700" />
             </button>
             <button
               onClick={() => formatText('italic')}
-              className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
+              className="p-2 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
               title="Italic"
             >
-              <Italic className="h-4 w-4 text-green-600" />
+              <Italic className="h-4 w-4 text-amber-700" />
             </button>
             <button
               onClick={() => formatText('list')}
-              className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
+              className="p-2 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
               title="Bullet Point"
             >
-              <List className="h-4 w-4 text-green-600" />
+              <List className="h-4 w-4 text-amber-700" />
             </button>
             <button
               onClick={() => fileInputRef.current?.click()}
-              className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
+              className="p-2 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
               title="Attach File"
             >
-              <Paperclip className="h-4 w-4 text-green-600" />
+              <Paperclip className="h-4 w-4 text-amber-700" />
             </button>
             <input
               ref={fileInputRef}
@@ -1,7 +1,7 @@
             <button
               onClick={() => setShowTemplates(!showTemplates)}
               className={`p-2 rounded-lg transition-colors ${
-                showTemplates ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600 hover:bg-green-200'
+                showTemplates ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
               }`}
               title="Quick Templates"
             >
@@ -1,7 +1,7 @@
             <button
               onClick={() => setPriority(priority === 'urgent' ? 'normal' : 'urgent')}
               className={`p-2 rounded-lg transition-colors ${
                 priority === 'urgent' 
                   ? 'bg-red-100 text-red-600' 
-                  : 'bg-green-100 text-green-600 hover:bg-green-200'
+                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
               }`}
               title="Priority"
             >
@@ -1,7 +1,7 @@
             <button
               onClick={() => setShowPreview(!showPreview)}
               className={`p-2 rounded-lg transition-colors ${
-                showPreview ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600 hover:bg-green-200'
+                showPreview ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
               }`}
               title="Preview"
             >
@@ -1,7 +1,7 @@
               value={newMessage}
               onChange={(e) => {
                 if (e.target.value.length <= 2000) {
                   setNewMessage(e.target.value);
                   setIsDraft(false);
                 }
               }}
               placeholder="Type your message..."
-              className="w-full p-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
+              className="w-full p-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
               rows={3}
               maxLength={2000}
             />
-            <div className="flex items-center justify-between mt-1">
-              <div className="flex items-center space-x-2 text-xs text-green-600">
+            <div className="flex items-center justify-between mt-1 text-amber-600">
+              <div className="flex items-center space-x-2 text-xs">
                 <span>{newMessage.length}/2000</span>
                 {isDraft && (
                   <div className="flex items-center space-x-1">
@@ -1,7 +1,7 @@
           <button
             onClick={handleSendMessage}
             disabled={!newMessage.trim()}
-            className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
+            className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
           >
             <Send className="h-5 w-5" />
           </button>
@@ -1,7 +1,7 @@
             type="datetime-local"
             value={scheduleTime}
             onChange={(e) => setScheduleTime(e.target.value)}
-            className="text-xs p-2 border border-green-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-300"
+            className="text-xs p-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
             min={new Date().toISOString().slice(0, 16)}
           />
-          <div className="text-xs text-green-600">
+          <div className="text-xs text-amber-600">
             {priority === 'urgent' && '⚠️ Urgent message'}
           </div>
         </div>