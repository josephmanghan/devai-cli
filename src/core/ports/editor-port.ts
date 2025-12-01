/**
 * Editor port interface for terminal editor integration.
 * Defines the contract for opening system editors with initial content
 * and capturing the user's edited output.
 */
export interface EditorPort {
  /**
   * Opens the system editor with the given initial content.
   * Uses the user's preferred terminal editor ($EDITOR) with fallback to 'nano'.
   * Creates a temporary file in .git/ directory for editor content.
   *
   * @param initialContent - The text content to pre-fill in the editor
   * @returns Promise that resolves to the edited content after user saves and quits
   * @throws {UserError} When editor is cancelled by user (Exit 2)
   * @throws {SystemError} When editor fails to spawn or crashes (Exit 3)
   */
  edit(initialContent: string): Promise<string>;
}
