@@ .. @@
   const sidebarContent = (
     <div className={`
-      h-full flex flex-col bg-gradient-to-b from-amber-50 to-orange-50 border-r border-amber-200 shadow-xl
+      h-full flex flex-col bg-white/95 backdrop-blur-sm border-r border-amber-200 shadow-xl
       ${isCollapsed ? 'w-20' : 'w-72'}
       transition-all duration-300 ease-in-out
     `}>
       {/* Header */}
-      <div className="p-6 border-b border-amber-200 bg-white/50">
+      <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
         <div className="flex items-center justify-between">
           {!isCollapsed && (
             <div className="flex items-center space-x-3">
-              <img 
-                src="/src/assets/Company Logo copy copy.jpeg"
-                alt="Curio Tutors"
-                className="w-10 h-10 object-contain rounded-xl shadow-md"
-              />
+              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
+                <BookOpen className="h-6 w-6 text-white" />
+              </div>
               
               <div>
                 <h2 className="text-lg font-bold text-amber-900">Curio Tutors</h2>
@@ -1,7 +1,7 @@
           <button
             onClick={() => setIsCollapsed(!isCollapsed)}
-            className="p-2 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
+            className="p-2 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300"
             aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
           >
             {isCollapsed ? (
@@ -1,7 +1,7 @@
       {/* Quick Actions */}
       {!isCollapsed && (
-        <div className="p-4 border-b border-amber-200">
+        <div className="p-4 border-b border-amber-200 bg-amber-50/50">
           <div className="grid grid-cols-2 gap-2">
-            <button className="flex items-center justify-center p-3 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-md">
+            <button className="flex items-center justify-center p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-md">
               <Plus className="h-4 w-4 mr-2" />
               <span className="text-xs font-medium">New</span>
             </button>
@@ -1,7 +1,7 @@
       </div>
 
       {/* Footer */}
-      <div className="p-4 border-t border-amber-200 bg-white/30">
+      <div className="p-4 border-t border-amber-200 bg-amber-50/50">
         {!isCollapsed ? (
-          <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
+          <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-amber-200">
             <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
               <span className="text-white font-bold text-sm">
                 {userType === 'student' ? 'S' : 'T'}